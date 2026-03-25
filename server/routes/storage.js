import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { cleanupOldImages, getStorageStats, cleanupOrphanedImages } from '../utils/cleanup.js';

const router = express.Router();

router.get('/stats', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const stats = await getStorageStats();
    res.json(stats);
  } catch (error) {
    console.error('Storage stats error:', error);
    res.status(500).json({ error: 'Failed to get storage stats' });
  }
});

router.post('/cleanup', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;
    const result = await cleanupOldImages(daysToKeep);
    res.json({ 
      message: 'Cleanup completed successfully',
      ...result 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

router.post('/cleanup-orphaned', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await cleanupOrphanedImages();
    res.json({ 
      message: 'Orphaned images cleanup completed',
      ...result 
    });
  } catch (error) {
    console.error('Orphaned cleanup error:', error);
    res.status(500).json({ error: 'Orphaned cleanup failed' });
  }
});

export default router;
