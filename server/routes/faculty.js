import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const [faculty] = await db.query(
      'SELECT id, school_id, name, email, created_at FROM users WHERE role = ?',
      ['faculty']
    );
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { schoolId, name, email } = req.body;

    if (!schoolId || !name) {
      return res.status(400).json({ error: 'School ID and name are required' });
    }

    const [existing] = await db.query(
      'SELECT * FROM users WHERE school_id = ?',
      [schoolId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'School ID already exists' });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const [result] = await db.query(
      'INSERT INTO users (school_id, name, email, password, role, is_temp_password) VALUES (?, ?, ?, ?, ?, ?)',
      [schoolId, name, email, hashedPassword, 'faculty', true]
    );

    res.status(201).json({
      id: result.insertId,
      schoolId,
      name,
      email,
      tempPassword
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ? AND role = ?',
      [name, email, id, 'faculty']
    );

    res.json({ message: 'Faculty updated successfully' });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'faculty']);

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/reset-password', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.query(
      'UPDATE users SET password = ?, is_temp_password = TRUE WHERE id = ? AND role = ?',
      [hashedPassword, id, 'faculty']
    );

    res.json({ tempPassword });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
