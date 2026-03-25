import db from '../config/database.js';

export const markAbsences = async () => {
  try {
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = now.toTimeString().split(' ')[0];
    
    // Get all schedules for today that have ended
    const [schedules] = await db.query(
      `SELECT s.*, u.name as faculty_name 
       FROM schedules s 
       JOIN users u ON s.faculty_id = u.id 
       WHERE s.day_of_week = ? AND s.end_time < ?`,
      [currentDay, currentTime]
    );

    let markedCount = 0;

    for (const schedule of schedules) {
      // Check if attendance was submitted for this schedule today
      const [attendance] = await db.query(
        `SELECT id FROM attendance 
         WHERE faculty_id = ? 
         AND schedule_id = ? 
         AND DATE(captured_at) = CURDATE()`,
        [schedule.faculty_id, schedule.id]
      );

      // If no attendance found, mark as absent
      if (attendance.length === 0) {
        await db.query(
          `INSERT INTO attendance (faculty_id, schedule_id, image_path, status, notes, captured_at) 
           VALUES (?, ?, ?, 'absent', 'Auto-marked: No attendance submitted', NOW())`,
          [schedule.faculty_id, schedule.id, '']
        );
        
        markedCount++;
        console.log(`📝 Marked absent: ${schedule.faculty_name} - Schedule ID ${schedule.id}`);
      }
    }

    if (markedCount > 0) {
      console.log(`✅ Absence check complete: ${markedCount} absences marked`);
    }

    return { markedCount, totalChecked: schedules.length };
  } catch (error) {
    console.error('Absence tracking error:', error);
    throw error;
  }
};

export const getAbsenceStats = async (facultyId = null, startDate = null, endDate = null) => {
  try {
    let query = `
      SELECT 
        u.id as faculty_id,
        u.name as faculty_name,
        u.school_id,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absences,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
        COUNT(*) as total_records
      FROM users u
      LEFT JOIN attendance a ON u.id = a.faculty_id
      WHERE u.role = 'faculty'
    `;

    const params = [];

    if (facultyId) {
      query += ' AND u.id = ?';
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

    query += ' GROUP BY u.id, u.name, u.school_id ORDER BY absences DESC';

    const [stats] = await db.query(query, params);
    return stats;
  } catch (error) {
    console.error('Get absence stats error:', error);
    throw error;
  }
};
