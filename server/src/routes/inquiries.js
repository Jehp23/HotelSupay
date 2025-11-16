import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { validate } from '../middleware/validate.js';
import prisma from '../lib/prisma.js';
import { sendMail } from '../utils/mailer.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// List inquiries (basic) - Admin/Operator only
router.get('/', requireAuth, requireRole('operator', 'admin'), async (_req, res) => {
  try {
    const items = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ error: 'Error al obtener las consultas' });
  }
});

// Create inquiry and send email
router.post(
  '/',
  body('name').isString().trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('message').isString().trim().isLength({ min: 5 }),
  validate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const { name, email, message, type, service, phone, guests, budget, eventDate } = req.body;
      const inquiry = await prisma.inquiry.create({
        data: {
          name,
          email,
          message,
          type: type || 'consulta',
          service,
          phone,
          guests: guests ? parseInt(guests) : null,
          budget,
          eventDate: eventDate ? new Date(eventDate) : null,
          priority: type === 'experiencia_vip' ? 'alta' : 'normal'
        }
      });

      // Send notification email (best effort)
      try {
        await sendMail({
          to: process.env.CONTACT_TO || email,
          subject: `Nueva consulta - Hotel Supai`,
          text: `${name} <${email}>\n\n${message}`,
          html: `<p><strong>${name}</strong> &lt;${email}&gt;</p><p>${message}</p>`,
        });
      } catch (err) {
        // Do not fail the API if email fails
        console.error('Email send error:', err.message);
      }

      res.status(201).json(inquiry);
    } catch (err) {
      console.error('Error creating inquiry:', err);
      res.status(500).json({ error: 'Error al enviar la consulta' });
    }
  }
);

// Mark as replied - Operator/Admin only
router.patch(
  '/:id/reply',
  requireAuth,
  requireRole('operator', 'admin'),
  param('id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const updated = await prisma.inquiry.update({
        where: { id: req.params.id },
        data: { repliedAt: new Date() }
      });
      if (!updated) return res.status(404).json({ error: 'Consulta no encontrada' });
      res.json(updated);
    } catch (err) {
      console.error('Error marking inquiry as replied:', err);
      res.status(500).json({ error: 'Error al marcar la consulta como respondida' });
    }
  }
);

export default router;
