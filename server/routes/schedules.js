import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT s.*, u.name as faculty_name, u.school_id,
             sub.course_code, sub.course_name, sub.year_level, 
             sub.major, sub.department, sub.section
      FROM schedules s 
      JOIN users u ON s.faculty_id = u.id
      JOIN subjects sub ON s.subject_id = sub.id
    `;
    let params = [];

    if (req.user.role === 'faculty') {
      query += ' WHERE s.faculty_id = ?';
      params.push(req.user.id);
    } else if (req.query.facultyId) {
      query += ' WHERE s.faculty_id = ?';
      params.push(req.query.facultyId);
    }

    query += ' ORDER BY FIELD(s.day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), s.start_time';

    const [schedules] = await db.query(query, params);
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { facultyId, subjectId, daysOfWeek, startTime, endTime, room } = req.body;

    if (!facultyId || !subjectId || !daysOfWeek || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify faculty exists
    const [faculty] = await db.query('SELECT id FROM users WHERE id = ? AND role = ?', [facultyId, 'faculty']);
    if (faculty.length === 0) {
      return res.status(400).json({ error: 'Faculty member not found' });
    }

    // Verify subject exists
    const [subject] = await db.query('SELECT id FROM subjects WHERE id = ?', [subjectId]);
    if (subject.length === 0) {
      return res.status(400).json({ error: 'Subject not found. Please create a subject first in the Subjects & Sections tab.' });
    }

    const days = Array.isArray(daysOfWeek) ? daysOfWeek : [daysOfWeek];
    
    if (days.length === 0) {
      return res.status(400).json({ error: 'At least one day must be selected' });
    }

    const insertedSchedules = [];
    
    for (const day of days) {
      const [result] = await db.query(
        'INSERT INTO schedules (faculty_id, subject_id, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?)',
        [facultyId, subjectId, day, startTime, endTime, room]
      );
      
      insertedSchedules.push({
        id: result.insertId,
        facultyId,
        subjectId,
        dayOfWeek: day,
        startTime,
        endTime,
        room
      });
    }

    res.status(201).json({
      message: `Schedule created for ${days.length} day(s)`,
      schedules: insertedSchedules
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    
    // Check for foreign key constraint error
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid faculty or subject ID. Please ensure both exist.' });
    }
    
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectId, dayOfWeek, startTime, endTime, room } = req.body;

    if (!subjectId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await db.query(
      'UPDATE schedules SET subject_id = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ? WHERE id = ?',
      [subjectId, dayOfWeek, startTime, endTime, room, id]
    );

    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM schedules WHERE id = ?', [id]);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
