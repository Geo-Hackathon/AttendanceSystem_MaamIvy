import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
    }
  }
});

// Get all students
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

    // No filtering by faculty - show all students so they can enroll them

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

// Bulk enroll students
router.post('/enroll-bulk', authenticateToken, async (req, res) => {
  try {
    const { studentIds, scheduleId } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !scheduleId) {
      return res.status(400).json({ error: 'Student IDs array and Schedule ID required' });
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

    // Enroll all students
    const enrollPromises = studentIds.map(studentId =>
      db.query(
        `INSERT INTO student_enrollments (student_id, schedule_id, status)
         VALUES (?, ?, 'active')
         ON DUPLICATE KEY UPDATE status = 'active'`,
        [studentId, scheduleId]
      )
    );

    await Promise.all(enrollPromises);

    res.status(201).json({ 
      message: `${studentIds.length} student${studentIds.length > 1 ? 's' : ''} enrolled successfully` 
    });
  } catch (error) {
    console.error('Bulk enroll error:', error);
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

// Bulk upload students from Excel/CSV
router.post('/bulk-upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse the Excel/CSV file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'File is empty or invalid format' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validate required fields
        const studentId = row['Student ID'] || row['student_id'];
        const firstName = row['First Name'] || row['first_name'];
        const lastName = row['Last Name'] || row['last_name'];
        const yearLevel = row['Year Level'] || row['year_level'];
        const department = row['Department'] || row['department'];

        if (!studentId || !firstName || !lastName || !yearLevel || !department) {
          results.failed++;
          results.errors.push({
            row: i + 2, // +2 because Excel rows start at 1 and we have a header
            error: 'Missing required fields',
            data: row
          });
          continue;
        }

        // Validate year level
        const validYearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        if (!validYearLevels.includes(yearLevel)) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            error: `Invalid year level: ${yearLevel}. Must be one of: ${validYearLevels.join(', ')}`,
            data: row
          });
          continue;
        }

        // Validate department
        const validDepartments = ['CTE', 'CBA', 'CLAPA', 'CIT', 'THEO'];
        if (!validDepartments.includes(department)) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            error: `Invalid department: ${department}. Must be one of: ${validDepartments.join(', ')}`,
            data: row
          });
          continue;
        }

        // Insert student
        await db.query(
          `INSERT INTO students (student_id, first_name, last_name, email, year_level, department, major, section)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           email = VALUES(email),
           year_level = VALUES(year_level),
           department = VALUES(department),
           major = VALUES(major),
           section = VALUES(section)`,
          [
            studentId,
            firstName,
            lastName,
            row['Email'] || row['email'] || null,
            yearLevel,
            department,
            row['Major'] || row['major'] || null,
            row['Section'] || row['section'] || null
          ]
        );

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
      }
    }

    res.json({
      message: `Bulk upload completed: ${results.success} students imported, ${results.failed} failed`,
      results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Server error during bulk upload' });
  }
});

// Delete student
router.delete('/:id', authenticateToken, authorizeRole('admin', 'faculty'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const [students] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete student enrollments first (foreign key constraint)
    await db.query('DELETE FROM student_enrollments WHERE student_id = ?', [id]);
    
    // Delete student attendance records
    await db.query('DELETE FROM student_attendance WHERE student_id = ?', [id]);
    
    // Delete the student
    await db.query('DELETE FROM students WHERE id = ?', [id]);
    
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
