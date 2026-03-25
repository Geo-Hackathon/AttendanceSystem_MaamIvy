import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, yearLevel } = req.query;
    
    let query = 'SELECT * FROM subjects WHERE 1=1';
    let params = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (yearLevel) {
      query += ' AND year_level = ?';
      params.push(yearLevel);
    }

    query += ' ORDER BY department, year_level, course_code';

    const [subjects] = await db.query(query, params);
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [subjects] = await db.query('SELECT * FROM subjects WHERE id = ?', [id]);
    
    if (subjects.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subjects[0]);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { courseCode, courseName, yearLevel, major, department, section } = req.body;

    if (!courseCode || !courseName || !yearLevel || !department) {
      return res.status(400).json({ error: 'Course code, name, year level, and department are required' });
    }

    const [result] = await db.query(
      'INSERT INTO subjects (course_code, course_name, year_level, major, department, section) VALUES (?, ?, ?, ?, ?, ?)',
      [courseCode, courseName, yearLevel, major, department, section]
    );

    res.status(201).json({
      id: result.insertId,
      courseCode,
      courseName,
      yearLevel,
      major,
      department,
      section
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Subject with this combination already exists' });
    }
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { courseCode, courseName, yearLevel, major, department, section } = req.body;

    if (!courseCode || !courseName || !yearLevel || !department) {
      return res.status(400).json({ error: 'Course code, name, year level, and department are required' });
    }

    await db.query(
      'UPDATE subjects SET course_code = ?, course_name = ?, year_level = ?, major = ?, department = ?, section = ? WHERE id = ?',
      [courseCode, courseName, yearLevel, major, department, section, id]
    );

    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Subject with this combination already exists' });
    }
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [schedules] = await db.query('SELECT COUNT(*) as count FROM schedules WHERE subject_id = ?', [id]);
    
    if (schedules[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete subject that is assigned to schedules. Please remove schedules first.' 
      });
    }

    await db.query('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
