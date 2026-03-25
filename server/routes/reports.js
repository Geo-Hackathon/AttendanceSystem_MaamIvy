import express from 'express';
import PDFDocument from 'pdfkit';
import db from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/pdf', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate, facultyId } = req.query;

    let query = `
      SELECT a.*, u.name as faculty_name, u.school_id,
             s.subject, s.day_of_week, s.start_time, s.end_time
      FROM attendance a
      JOIN users u ON a.faculty_id = u.id
      LEFT JOIN schedules s ON a.schedule_id = s.id
      WHERE 1=1
    `;
    let params = [];

    if (facultyId) {
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

    query += ' ORDER BY a.captured_at DESC';

    const [attendance] = await db.query(query, params);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Faculty Attendance Report', { align: 'center' });
    doc.moveDown();
    
    if (startDate || endDate) {
      doc.fontSize(12).text(`Period: ${startDate || 'Start'} to ${endDate || 'Present'}`, { align: 'center' });
      doc.moveDown();
    }

    doc.fontSize(10);
    attendance.forEach((record, index) => {
      if (index > 0 && index % 15 === 0) {
        doc.addPage();
      }

      doc.text(`Faculty: ${record.faculty_name} (${record.school_id})`);
      doc.text(`Subject: ${record.subject || 'N/A'}`);
      doc.text(`Date/Time: ${new Date(record.captured_at).toLocaleString()}`);
      doc.text(`Status: ${record.status.toUpperCase()}`);
      if (record.notes) {
        doc.text(`Notes: ${record.notes}`);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
