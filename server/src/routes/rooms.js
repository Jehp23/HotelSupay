import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET all rooms
router.get('/', async (_req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        amenities: true,
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Error al obtener las habitaciones' });
  }
});

// GET availability by room type
router.get('/availability/check', async (req, res) => {
  try {
    const { checkIn, checkOut, roomType } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn y checkOut son requeridos' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (end <= start) {
      return res.status(400).json({ error: 'checkOut debe ser posterior a checkIn' });
    }

    // Tipos de habitación a consultar
    const types = roomType ? [roomType] : ['estandar', 'lujo', 'familiar', 'presidencial', 'cordillera'];
    
    const availability = {};

    for (const type of types) {
      // Total de habitaciones de este tipo
      const totalRooms = await prisma.room.count({
        where: { type, status: { notIn: ['fuera_de_servicio'] } }
      });

      // Habitaciones ocupadas en esas fechas
      const occupiedRooms = await prisma.reservation.count({
        where: {
          roomType: type,
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

      // Obtener precio promedio del tipo
      const avgPrice = await prisma.room.aggregate({
        where: { type },
        _avg: { price: true }
      });

      availability[type] = {
        available: Math.max(0, available),
        total: totalRooms,
        price: avgPrice._avg.price || 0
      };
    }

    res.json(availability);
  } catch (err) {
    console.error('Error checking availability:', err);
    res.status(500).json({ error: 'Error al verificar disponibilidad' });
  }
});

// GET one room
router.get('/:id', param('id').isUUID(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        amenities: true,
        images: true,
        maintenance: true,
        specialRequests: true
      }
    });
    if (!room) return res.status(404).json({ error: 'Habitación no encontrada' });
    res.json(room);
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ error: 'Error al obtener la habitación' });
  }
});

// CREATE room (admin)
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('price').isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const { name, roomNumber, type, price, amenities = [], images = [], description, floor, capacity, maxCapacity } = req.body;
      
      const room = await prisma.room.create({
        data: {
          name,
          roomNumber: roomNumber || `R${Date.now()}`,
          type: type || 'estandar',
          price,
          floor: floor || 1,
          capacity: capacity || 2,
          maxCapacity: maxCapacity || 3,
          description,
          amenities: {
            create: amenities.map(amenity => ({ amenity }))
          },
          images: {
            create: images.map((url, index) => ({ url, order: index }))
          }
        },
        include: {
          amenities: true,
          images: true
        }
      });
      
      res.status(201).json(room);
    } catch (err) {
      console.error('Error creating room:', err);
      res.status(500).json({ error: 'Error al crear la habitación' });
    }
  }
);

// UPDATE room (admin/operator - operators can update status, cleaning, maintenance)
router.patch(
  '/:id',
  requireAuth,
  requireRole('operator', 'admin'),
  param('id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      // If user is operator, only allow certain fields
      if (req.user.role === 'operator') {
        const allowedFields = [
          'status', 'cleaningStatus', 'lastCleaned', 'cleanedBy',
          'currentGuest', 'checkInDate', 'checkOutDate', 'notes'
        ];
        const updateData = {};
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        });
        const room = await prisma.room.update({
          where: { id: req.params.id },
          data: updateData,
          include: {
            amenities: true,
            images: true
          }
        });
        return res.json(room);
      }
      
      // Admin can update everything
      const room = await prisma.room.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          amenities: true,
          images: true
        }
      });
      res.json(room);
    } catch (err) {
      console.error('Error updating room:', err);
      res.status(500).json({ error: 'Error al actualizar la habitación' });
    }
  }
);

// Change status open/closed/occupied (operator)
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('operator', 'admin'),
  [
    param('id').isUUID(),
    body('status').isIn(['disponible', 'ocupada', 'limpieza', 'mantenimiento', 'fuera_de_servicio', 'reservada'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const room = await prisma.room.update({
        where: { id: req.params.id },
        data: { status: req.body.status }
      });
      res.json(room);
    } catch (err) {
      console.error('Error updating room status:', err);
      res.status(500).json({ error: 'Error al actualizar el estado de la habitación' });
    }
  }
);

// DELETE room (admin)
router.delete('/:id', requireAuth, requireRole('admin'), param('id').isUUID(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    await prisma.room.delete({
      where: { id: req.params.id }
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: 'Error al eliminar la habitación' });
  }
});

export default router;
