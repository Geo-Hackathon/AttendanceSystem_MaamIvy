import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload, compressImage } from '../middleware/upload.js';

const router = express.Router();

router.post('/submit', authenticateToken, authorizeRole('faculty'), upload.single('image'), compressImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const { scheduleId, notes } = req.body;
    const imagePath = req.file.path;

    let status = 'present';
    if (scheduleId) {
      const [schedules] = await db.query(
        'SELECT * FROM schedules WHERE id = ? AND faculty_id = ?',
        [scheduleId, req.user.id]
      );

      if (schedules.length > 0) {
        const schedule = schedules[0];
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0];
        
        // Parse times for comparison
        const [currentHour, currentMin, currentSec] = currentTime.split(':').map(Number);
        const [startHour, startMin] = schedule.start_time.split(':').map(Number);
        const [endHour, endMin] = schedule.end_time.split(':').map(Number);
        
        const currentMinutes = currentHour * 60 + currentMin;
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        // Allow submission 5 minutes before start time
        const allowedStartMinutes = startMinutes - 5;
        // Allow submission up to 15 minutes after start time
        const lateThresholdMinutes = startMinutes + 15;
        
        if (currentMinutes < allowedStartMinutes) {
          return res.status(400).json({ 
            error: 'Too early! You can only submit attendance 5 minutes before your scheduled class.' 
          });
        }
        
        if (currentMinutes > lateThresholdMinutes) {
          return res.status(400).json({ 
            error: 'Too late! Attendance can only be submitted within 15 minutes after class starts.' 
          });
        }
        
        // Mark as late if submitted after start time
        if (currentMinutes > startMinutes) {
          status = 'late';
        }
      }
    }

    const [result] = await db.query(
      'INSERT INTO attendance (faculty_id, schedule_id, image_path, status, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, scheduleId || null, imagePath, status, notes]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Attendance submitted successfully',
      status
    });
  } catch (error) {
    console.error('Submit attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, facultyId, status } = req.query;
    
    let query = `
      SELECT a.*, u.name as faculty_name, u.school_id, 
             s.day_of_week, s.start_time, s.end_time,
             sub.course_code, sub.course_name, sub.year_level, sub.section, sub.department
      FROM attendance a
      JOIN users u ON a.faculty_id = u.id
      LEFT JOIN schedules s ON a.schedule_id = s.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE 1=1
    `;
    let params = [];

    if (req.user.role === 'faculty') {
      query += ' AND a.faculty_id = ?';
      params.push(req.user.id);
    } else if (facultyId) {
      query += ' AND a.faculty_id = ?';
      params.push(facultyId);
    }

    if (startDate) {
      query += ' AND DATE(a.captured_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(a.captured_at) <= ?';
      params.push(endDate);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.captured_at DESC';

    const [attendance] = await db.query(query, params);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/analytics', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { period = 'weekly', facultyId } = req.query;
    
    let dateFilter = '';
    if (period === 'weekly') {
      dateFilter = 'AND a.captured_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'monthly') {
      dateFilter = 'AND a.captured_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    let facultyFilter = '';
    let params = [];
    if (facultyId) {
      facultyFilter = 'AND a.faculty_id = ?';
      params.push(facultyId);
    }

    const [stats] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.school_id,
        COUNT(a.id) as total_attendance,
        COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) as on_time,
        COALESCE(SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END), 0) as late,
        (SELECT COUNT(*) FROM schedules WHERE faculty_id = u.id) as total_schedules,
        (SELECT GROUP_CONCAT(DISTINCT day_of_week ORDER BY 
          FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
          SEPARATOR ', ') 
         FROM schedules WHERE faculty_id = u.id) as schedule_days
      FROM users u
      LEFT JOIN attendance a ON u.id = a.faculty_id ${dateFilter}
      WHERE u.role = 'faculty' ${facultyFilter}
      GROUP BY u.id, u.name, u.school_id
    `, params);

    const [dailyStats] = await db.query(`
      SELECT 
        DATE(a.captured_at) as date,
        COUNT(a.id) as count,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late
      FROM attendance a
      WHERE 1=1 ${dateFilter} ${facultyFilter}
      GROUP BY DATE(a.captured_at)
      ORDER BY date DESC
    `, params);

    res.json({
      facultyStats: stats,
      dailyStats
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
