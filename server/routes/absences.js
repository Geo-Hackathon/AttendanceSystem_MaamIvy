import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { markAbsences, getAbsenceStats } from '../utils/absenceTracker.js';

const router = express.Router();

// Manually trigger absence check (admin only)
router.post('/check', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await markAbsences();
    res.json({
      message: 'Absence check completed',
      ...result
    });
  } catch (error) {
    console.error('Manual absence check error:', error);
    res.status(500).json({ error: 'Failed to check absences' });
  }
});

// Get absence statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { facultyId, startDate, endDate } = req.query;
    
    // Faculty can only view their own stats
    const targetFacultyId = req.user.role === 'admin' ? facultyId : req.user.id;
    
    const stats = await getAbsenceStats(targetFacultyId, startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('Get absence stats error:', error);
    res.status(500).json({ error: 'Failed to get absence statistics' });
  }
});

export default router;
