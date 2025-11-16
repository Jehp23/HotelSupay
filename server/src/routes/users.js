import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/users - Listar usuarios (solo admin)
router.get(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    query('role').optional().isIn(['guest', 'operator', 'admin']),
    query('active').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const filter = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.active !== undefined) filter.active = req.query.active === 'true';

      const where = {};
      if (filter.role) where.role = filter.role;
      if (filter.active !== undefined) where.active = filter.active;

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }
);

// GET /api/users/:id - Obtener usuario por ID (admin o el mismo usuario)
router.get(
  '/:id',
  requireAuth,
  param('id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // Solo admin o el mismo usuario puede ver los detalles
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'No tienes permisos para ver este usuario' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      res.json(user);
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  }
);

// POST /api/users - Crear usuario (solo admin)
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6, max: 50 }),
    body('role').isIn(['guest', 'operator', 'admin']),
    body('active').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, role, active = true } = req.body;

      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          active
        }
      });

      // Responder sin la contraseña
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(201).json(userResponse);
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  }
);

// PUT /api/users/:id - Actualizar usuario
router.put(
  '/:id',
  requireAuth,
  [
    param('id').isUUID(),
    body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isString().isLength({ min: 6, max: 50 }),
    body('role').optional().isIn(['guest', 'operator', 'admin']),
    body('active').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const userId = req.params.id;
      const updates = req.body;

      // Solo admin puede actualizar otros usuarios o cambiar roles
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({ error: 'No tienes permisos para actualizar este usuario' });
      }

      // Solo admin puede cambiar roles
      if (updates.role && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Solo los administradores pueden cambiar roles' });
      }

      // Verificar si el usuario existe
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      // Si se actualiza el email, verificar que no exista
      if (updates.email && updates.email !== user.email) {
        const emailExists = await prisma.user.findUnique({ where: { email: updates.email } });
        if (emailExists) {
          return res.status(409).json({ error: 'El email ya está en uso' });
        }
      }

      // Si se actualiza la contraseña, hashearla
      if (updates.password) {
        const saltRounds = 12;
        updates.password = await bcrypt.hash(updates.password, saltRounds);
      }

      // Actualizar usuario
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(updatedUser);
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  }
);

// DELETE /api/users/:id - Desactivar usuario (soft delete)
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  param('id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const userId = req.params.id;

      // No permitir que el admin se desactive a sí mismo
      if (req.user.id === userId) {
        return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { active: false },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      res.json({ message: 'Usuario desactivado correctamente', user });
    } catch (err) {
      console.error('Error deactivating user:', err);
      res.status(500).json({ error: 'Error al desactivar el usuario' });
    }
  }
);

// PATCH /api/users/:id/activate - Reactivar usuario
router.patch(
  '/:id/activate',
  requireAuth,
  requireRole('admin'),
  param('id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { active: true },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      res.json({ message: 'Usuario reactivado correctamente', user });
    } catch (err) {
      console.error('Error activating user:', err);
      res.status(500).json({ error: 'Error al reactivar el usuario' });
    }
  }
);

// GET /api/users/me - Obtener perfil del usuario actual
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

export default router;
