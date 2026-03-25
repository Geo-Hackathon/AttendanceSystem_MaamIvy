import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all students (admin) or students enrolled in faculty's classes (faculty)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, yearLevel, section, scheduleId } = req.query;
    
    let query = `
      SELECT s.*, 
             COUNT(DISTINCT se.schedule_id) as enrolled_classes
      FROM students s
      LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.status = 'active'
      WHERE 1=1
    `;
    const params = [];

    // If faculty, only show students in their classes
    if (req.user.role === 'faculty') {
      query += ` AND se.schedule_id IN (
        SELECT id FROM schedules WHERE faculty_id = ?
      )`;
      params.push(req.user.id);
    }

    if (department) {
      query += ' AND s.department = ?';
      params.push(department);
    }

    if (yearLevel) {
      query += ' AND s.year_level = ?';
      params.push(yearLevel);
    }

    if (section) {
      query += ' AND s.section = ?';
      params.push(section);
    }

    if (scheduleId) {
      query += ` AND s.id IN (
        SELECT student_id FROM student_enrollments 
        WHERE schedule_id = ? AND status = 'active'
      )`;
      params.push(scheduleId);
    }

    query += ' GROUP BY s.id ORDER BY s.last_name, s.first_name';

    const [students] = await db.query(query, params);
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new student (admin or faculty)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, firstName, lastName, email, yearLevel, department, major, section } = req.body;

    if (!studentId || !firstName || !lastName || !yearLevel || !department) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const [result] = await db.query(
      `INSERT INTO students (student_id, first_name, last_name, email, year_level, department, major, section)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, firstName, lastName, email, yearLevel, department, major, section]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Student created successfully'
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update student
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, yearLevel, department, major, section } = req.body;

    await db.query(
      `UPDATE students 
       SET first_name = ?, last_name = ?, email = ?, year_level = ?, 
           department = ?, major = ?, section = ?
       WHERE id = ?`,
      [firstName, lastName, email, yearLevel, department, major, section, id]
    );

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Enroll student in a class
router.post('/enroll', authenticateToken, async (req, res) => {
  try {
    const { studentId, scheduleId } = req.body;

    if (!studentId || !scheduleId) {
      return res.status(400).json({ error: 'Student ID and Schedule ID required' });
    }

    // Verify faculty owns this schedule if not admin
    if (req.user.role === 'faculty') {
      const [schedule] = await db.query(
        'SELECT id FROM schedules WHERE id = ? AND faculty_id = ?',
        [scheduleId, req.user.id]
      );
      if (schedule.length === 0) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    await db.query(
      `INSERT INTO student_enrollments (student_id, schedule_id, status)
       VALUES (?, ?, 'active')
       ON DUPLICATE KEY UPDATE status = 'active'`,
      [studentId, scheduleId]
    );

    res.status(201).json({ message: 'Student enrolled successfully' });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Drop student from class
router.post('/drop', authenticateToken, async (req, res) => {
  try {
    const { studentId, scheduleId } = req.body;

    // Verify faculty owns this schedule if not admin
    if (req.user.role === 'faculty') {
      const [schedule] = await db.query(
        'SELECT id FROM schedules WHERE id = ? AND faculty_id = ?',
        [scheduleId, req.user.id]
      );
      if (schedule.length === 0) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    await db.query(
      `UPDATE student_enrollments 
       SET status = 'dropped'
       WHERE student_id = ? AND schedule_id = ?`,
      [studentId, scheduleId]
    );

    res.json({ message: 'Student dropped from class' });
  } catch (error) {
    console.error('Drop student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students enrolled in a specific schedule
router.get('/schedule/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Verify faculty owns this schedule if not admin
    if (req.user.role === 'faculty') {
      const [schedule] = await db.query(
        'SELECT id FROM schedules WHERE id = ? AND faculty_id = ?',
        [scheduleId, req.user.id]
      );
      if (schedule.length === 0) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    const [students] = await db.query(
      `SELECT s.*, se.enrolled_at, se.status as enrollment_status
       FROM students s
       JOIN student_enrollments se ON s.id = se.student_id
       WHERE se.schedule_id = ? AND se.status = 'active'
       ORDER BY s.last_name, s.first_name`,
      [scheduleId]
    );

    res.json(students);
  } catch (error) {
    console.error('Get schedule students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
