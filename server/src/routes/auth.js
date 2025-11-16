import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'

const router = Router()

function signToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name }
  return jwt.sign(payload, process.env.JWT_SECRET || 'changeme-super-secret', { expiresIn: '7d' })
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { name, email, password } = req.body
    try {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) return res.status(409).json({ error: 'Email ya registrado' })
      
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      const user = await prisma.user.create({ 
        data: { name, email, password: hashedPassword, role: 'guest' } 
      })
      const token = signToken(user)
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({ error: 'No se pudo crear el usuario' })
    }
  }
)

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { email, password } = req.body
    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.active) return res.status(401).json({ error: 'Credenciales inválidas' })
      
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) return res.status(401).json({ error: 'Credenciales inválidas' })
      
      const token = signToken(user)
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    } catch (err) {
      console.error('Login error:', err)
      res.status(500).json({ error: 'Error al iniciar sesión' })
    }
  }
)

export default router
