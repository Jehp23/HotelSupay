import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// List reservations (basic filters) - Admin/Operator only
router.get(
  '/',
  requireAuth,
  requireRole('operator', 'admin'),
  query('status').optional().isIn(['pending', 'confirmed', 'released', 'cancelled']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const where = {};
      if (req.query.status) where.status = req.query.status;
      const items = await prisma.reservation.findMany({
        where,
        include: {
          room: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(items);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      res.status(500).json({ error: 'Error al obtener las reservas' });
    }
  }
);

// List current user's reservations (by JWT email)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.json([]);
    const items = await prisma.reservation.findMany({
      where: { email },
      include: {
        room: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching user reservations:', err);
    res.status(500).json({ error: 'Error al obtener tus reservas' });
  }
});

// Create reservation (by ROOM TYPE, not specific room)
router.post(
  '/',
  body('roomType').isIn(['estandar', 'lujo', 'familiar', 'presidencial', 'cordillera']),
  body('name').isString().trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('phone').optional().isString(),
  body('checkIn').isISO8601(),
  body('checkOut').isISO8601(),
  body('people').isInt({ min: 1 }),
  body('specialRequests').optional().isString(),
  validate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const { roomType, name, email, phone, checkIn, checkOut, people, specialRequests } = req.body;

      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (!(end > start)) return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada' });

      // Verificar disponibilidad del tipo de habitación
      const totalRooms = await prisma.room.count({
        where: { type: roomType, status: { notIn: ['fuera_de_servicio'] } }
      });

      const occupiedRooms = await prisma.reservation.count({
        where: {
          roomType,
          status: { in: ['pending', 'confirmed'] },
          OR: [
            {
              AND: [
                { checkIn: { lt: end } },
                { checkOut: { gt: start } }
              ]
            }
          ]
        }
      });

      const available = totalRooms - occupiedRooms;
      if (available <= 0) {
        return res.status(409).json({ 
          error: `No hay habitaciones tipo ${roomType} disponibles para las fechas seleccionadas` 
        });
      }

      // Calcular precio total
      const avgPrice = await prisma.room.aggregate({
        where: { type: roomType },
        _avg: { price: true }
      });

      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = (avgPrice._avg.price || 0) * nights;

      const reservation = await prisma.reservation.create({
        data: {
          roomType,
          name,
          email,
          phone,
          checkIn: start,
          checkOut: end,
          people,
          specialRequests,
          totalPrice,
          status: 'pending'
        }
      });

      res.status(201).json(reservation);
    } catch (err) {
      console.error('Error creating reservation:', err);
      res.status(500).json({ error: 'Error al crear la reserva' });
    }
  }
);

// Update reservation status (confirm, release, cancel) - Operator/Admin only
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('operator', 'admin'),
  [
    param('id').isUUID(),
    body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const updated = await prisma.reservation.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
        include: {
          room: true
        }
      });
      res.json(updated);
    } catch (err) {
      console.error('Error updating reservation status:', err);
      res.status(500).json({ error: 'Error al actualizar el estado de la reserva' });
    }
  }
);

// PATCH payment status
router.patch(
  '/:id/payment',
  requireAuth,
  requireRole('operator', 'admin'),
  [
    param('id').isUUID(),
    body('paymentStatus').isIn(['pending', 'paid', 'refunded', 'cancelled'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const updated = await prisma.reservation.update({
        where: { id: req.params.id },
        data: { paymentStatus: req.body.paymentStatus },
        include: { room: true }
      });
      res.json(updated);
    } catch (err) {
      console.error('Error updating payment status:', err);
      res.status(500).json({ error: 'Error al actualizar el estado de pago' });
    }
  }
);

// PATCH assign room to reservation (operator/admin)
router.patch(
  '/:id/assign-room',
  requireAuth,
  requireRole('operator', 'admin'),
  [
    param('id').isUUID(),
    body('roomId').isUUID()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const { roomId } = req.body;
      
      // Verificar que la reserva existe
      const reservation = await prisma.reservation.findUnique({
        where: { id: req.params.id }
      });
      if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
      
      // Verificar que la habitación existe y es del tipo correcto
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) return res.status(404).json({ error: 'Habitación no encontrada' });
      
      if (room.type !== reservation.roomType) {
        return res.status(400).json({ 
          error: `La habitación debe ser tipo ${reservation.roomType}` 
        });
      }
      
      // Verificar que la habitación esté disponible
      if (room.status !== 'disponible') {
        return res.status(409).json({ error: 'La habitación no está disponible' });
      }
      
      // Asignar habitación y cambiar estado
      const updated = await prisma.reservation.update({
        where: { id: req.params.id },
        data: { roomId },
        include: { room: true }
      });
      
      // Cambiar estado de habitación a reservada
      await prisma.room.update({
        where: { id: roomId },
        data: { status: 'reservada' }
      });
      
      res.json(updated);
    } catch (err) {
      console.error('Error assigning room:', err);
      res.status(500).json({ error: 'Error al asignar habitación' });
    }
  }
);

// POST check-in (operator/admin)
router.post(
  '/:id/checkin',
  requireAuth,
  requireRole('operator', 'admin'),
  param('id').isUUID(),
  body('roomId').optional().isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: req.params.id },
        include: { room: true }
      });
      
      if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
      
      let roomId = reservation.roomId || req.body.roomId;
      
      // Si no tiene habitación asignada, buscar una disponible del tipo correcto
      if (!roomId) {
        const availableRoom = await prisma.room.findFirst({
          where: {
            type: reservation.roomType,
            status: 'disponible'
          }
        });
        
        if (!availableRoom) {
          return res.status(409).json({ 
            error: `No hay habitaciones tipo ${reservation.roomType} disponibles` 
          });
        }
        
        roomId = availableRoom.id;
      }
      
      // Actualizar reserva
      const updated = await prisma.reservation.update({
        where: { id: req.params.id },
        data: {
          roomId,
          status: 'confirmed'
        },
        include: { room: true }
      });
      
      // Actualizar habitación
      await prisma.room.update({
        where: { id: roomId },
        data: {
          status: 'ocupada',
          currentGuest: reservation.name,
          checkInDate: reservation.checkIn,
          checkOutDate: reservation.checkOut
        }
      });
      
      res.json(updated);
    } catch (err) {
      console.error('Error during check-in:', err);
      res.status(500).json({ error: 'Error al hacer check-in' });
    }
  }
);

// POST check-out (operator/admin)
router.post(
  '/:id/checkout',
  requireAuth,
  requireRole('operator', 'admin'),
  param('id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: req.params.id },
        include: { room: true }
      });
      
      if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
      if (!reservation.roomId) return res.status(400).json({ error: 'La reserva no tiene habitación asignada' });
      
      // Actualizar reserva
      const updated = await prisma.reservation.update({
        where: { id: req.params.id },
        data: { status: 'completed' },
        include: { room: true }
      });
      
      // Liberar habitación y marcar para limpieza
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: {
          status: 'limpieza',
          cleaningStatus: 'sucia',
          currentGuest: null,
          checkInDate: null,
          checkOutDate: null,
          lastOccupied: new Date()
        }
      });
      
      res.json(updated);
    } catch (err) {
      console.error('Error during check-out:', err);
      res.status(500).json({ error: 'Error al hacer check-out' });
    }
  }
);

export default router;
