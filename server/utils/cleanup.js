import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads/attendance');

export const cleanupOldImages = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const [oldRecords] = await db.query(
      'SELECT image_path FROM attendance WHERE captured_at < ?',
      [cutoffDate]
    );

    let deletedCount = 0;
    let failedCount = 0;

    for (const record of oldRecords) {
      try {
        if (fs.existsSync(record.image_path)) {
          fs.unlinkSync(record.image_path);
          deletedCount++;
        }
      } catch (err) {
        console.error(`Failed to delete ${record.image_path}:`, err.message);
        failedCount++;
      }
    }

    await db.query('DELETE FROM attendance WHERE captured_at < ?', [cutoffDate]);

    console.log(`🧹 Cleanup completed: ${deletedCount} images deleted, ${failedCount} failed, ${oldRecords.length - deletedCount - failedCount} already removed`);
    
    return { deletedCount, failedCount, totalProcessed: oldRecords.length };
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
};

export const getStorageStats = async () => {
  try {
    const [attendanceCount] = await db.query('SELECT COUNT(*) as count FROM attendance');
    
    let totalSize = 0;
    let fileCount = 0;

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      fileCount = files.length;
      
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        try {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        } catch (err) {
          console.error(`Error reading file ${file}:`, err.message);
        }
      });
    }

    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    const totalSizeGB = (totalSize / (1024 * 1024 * 1024)).toFixed(3);
    const avgSizeKB = fileCount > 0 ? ((totalSize / fileCount) / 1024).toFixed(2) : 0;

    return {
      totalFiles: fileCount,
      totalSizeMB,
      totalSizeGB,
      avgSizeKB,
      attendanceRecords: attendanceCount[0].count,
      storageUsagePercent: ((parseFloat(totalSizeGB) / 5) * 100).toFixed(2)
    };
  } catch (error) {
    console.error('Storage stats error:', error);
    throw error;
  }
};

export const cleanupOrphanedImages = async () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return { deletedCount: 0 };
    }

    const [dbImages] = await db.query('SELECT image_path FROM attendance');
    const dbImagePaths = new Set(dbImages.map(record => path.basename(record.image_path)));

    const files = fs.readdirSync(uploadDir);
    let deletedCount = 0;

    for (const file of files) {
      if (!dbImagePaths.has(file)) {
        try {
          fs.unlinkSync(path.join(uploadDir, file));
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete orphaned file ${file}:`, err.message);
        }
      }
    }

    console.log(`🧹 Orphaned images cleanup: ${deletedCount} files removed`);
    return { deletedCount };
  } catch (error) {
    console.error('Orphaned cleanup error:', error);
    throw error;
  }
};
