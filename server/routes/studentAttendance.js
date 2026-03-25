import express from 'express';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Record student attendance for a class session
router.post('/record', authenticateToken, authorizeRole('faculty'), async (req, res) => {
  try {
    const { scheduleId, attendanceRecords, facultyAttendanceId } = req.body;
    // attendanceRecords: [{ studentId, status, notes }]

    if (!scheduleId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Verify faculty owns this schedule
    const [schedule] = await db.query(
      'SELECT id FROM schedules WHERE id = ? AND faculty_id = ?',
      [scheduleId, req.user.id]
    );

    if (schedule.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    // Insert attendance records
    for (const record of attendanceRecords) {
      await db.query(
        `INSERT INTO student_attendance 
         (student_id, schedule_id, faculty_attendance_id, status, attendance_date, time_recorded, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         status = VALUES(status), 
         time_recorded = VALUES(time_recorded),
         notes = VALUES(notes)`,
        [
          record.studentId,
          scheduleId,
          facultyAttendanceId || null,
          record.status || 'present',
          today,
          currentTime,
          record.notes || null,
          req.user.id
        ]
      );
    }

    res.status(201).json({
      message: `Attendance recorded for ${attendanceRecords.length} students`
    });
  } catch (error) {
    console.error('Record student attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student attendance for a schedule
router.get('/schedule/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify access
    if (req.user.role === 'faculty') {
      const [schedule] = await db.query(
        'SELECT id FROM schedules WHERE id = ? AND faculty_id = ?',
        [scheduleId, req.user.id]
      );
      if (schedule.length === 0) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    let query = `
      SELECT sa.*, 
             s.student_id, s.first_name, s.last_name,
             u.name as recorded_by_name
      FROM student_attendance sa
      JOIN students s ON sa.student_id = s.id
      JOIN users u ON sa.recorded_by = u.id
      WHERE sa.schedule_id = ?
    `;
    const params = [scheduleId];

    if (startDate) {
      query += ' AND sa.attendance_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND sa.attendance_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY sa.attendance_date DESC, s.last_name, s.first_name';

    const [records] = await db.query(query, params);
    res.json(records);
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attendance summary for a student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { scheduleId } = req.query;

    let query = `
      SELECT sa.*,
             sch.day_of_week, sch.start_time, sch.end_time,
             sub.course_code, sub.course_name,
             u.name as faculty_name
      FROM student_attendance sa
      JOIN schedules sch ON sa.schedule_id = sch.id
      JOIN subjects sub ON sch.subject_id = sub.id
      JOIN users u ON sch.faculty_id = u.id
      WHERE sa.student_id = ?
    `;
    const params = [studentId];

    if (scheduleId) {
      query += ' AND sa.schedule_id = ?';
      params.push(scheduleId);
    }

    query += ' ORDER BY sa.attendance_date DESC';

    const [records] = await db.query(query, params);
    res.json(records);
  } catch (error) {
    console.error('Get student attendance summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attendance statistics for students in a schedule
router.get('/stats/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Verify access
    if (req.user.role === 'faculty') {
      const [schedule] = await db.query(
        'SELECT id FROM schedules WHERE id = ? AND faculty_id = ?',
        [scheduleId, req.user.id]
      );
      if (schedule.length === 0) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    const [stats] = await db.query(
      `SELECT 
         s.id, s.student_id, s.first_name, s.last_name,
         COUNT(sa.id) as total_sessions,
         SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) as present_count,
         SUM(CASE WHEN sa.status = 'late' THEN 1 ELSE 0 END) as late_count,
         SUM(CASE WHEN sa.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
         SUM(CASE WHEN sa.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
         ROUND((SUM(CASE WHEN sa.status IN ('present', 'late') THEN 1 ELSE 0 END) / COUNT(sa.id)) * 100, 2) as attendance_rate
       FROM students s
       JOIN student_enrollments se ON s.id = se.student_id
       LEFT JOIN student_attendance sa ON s.id = sa.student_id AND sa.schedule_id = ?
       WHERE se.schedule_id = ? AND se.status = 'active'
       GROUP BY s.id
       ORDER BY s.last_name, s.first_name`,
      [scheduleId, scheduleId]
    );

    res.json(stats);
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
