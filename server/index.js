import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import subjectRoutes from './routes/subjects.js';
import scheduleRoutes from './routes/schedules.js';
import attendanceRoutes from './routes/attendance.js';
import reportRoutes from './routes/reports.js';
import storageRoutes from './routes/storage.js';
import absenceRoutes from './routes/absences.js';
import studentRoutes from './routes/students.js';
import studentAttendanceRoutes from './routes/studentAttendance.js';
import { cleanupOldImages, cleanupOrphanedImages } from './utils/cleanup.js';
import { markAbsences } from './utils/absenceTracker.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/student-attendance', studentAttendanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Faculty Attendance System API is running' });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    
    // Run cleanup on startup
    setTimeout(async () => {
      try {
        await cleanupOrphanedImages();
      } catch (error) {
        console.error('Initial cleanup failed:', error);
      }
    }, 5000);
    
    // Schedule daily cleanup at 2 AM
    const scheduleCleanup = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        2, 0, 0
      );
      const msToMidnight = night.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          console.log('🧹 Running scheduled cleanup...');
          await cleanupOldImages(90); // Keep 90 days
          await cleanupOrphanedImages();
        } catch (error) {
          console.error('Scheduled cleanup failed:', error);
        }
        scheduleCleanup(); // Schedule next cleanup
      }, msToMidnight);
    };
    
    scheduleCleanup();
    
    // Schedule absence checking every hour
    const scheduleAbsenceCheck = () => {
      setInterval(async () => {
        try {
          console.log('📋 Running absence check...');
          await markAbsences();
        } catch (error) {
          console.error('Absence check failed:', error);
        }
      }, 60 * 60 * 1000); // Every hour
    };
    
    scheduleAbsenceCheck();
    
    // Run initial absence check after 1 minute
    setTimeout(async () => {
      try {
        await markAbsences();
      } catch (error) {
        console.error('Initial absence check failed:', error);
      }
    }, 60000);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🧹 Auto-cleanup scheduled (keeps 90 days of images)`);
      console.log(`📋 Absence tracking active (checks every hour)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
