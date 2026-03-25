import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'faculty_attendance',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 5 : 10,
  queueLimit: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'faculty') NOT NULL DEFAULT 'faculty',
        is_temp_password BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_code VARCHAR(50) NOT NULL,
        course_name VARCHAR(200) NOT NULL,
        year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
        major VARCHAR(100),
        department ENUM('CTE', 'CBA', 'CLAPA', 'CIT', 'THEO') NOT NULL,
        section VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_subject (course_code, year_level, major, section)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL,
        subject_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL,
        schedule_id INT,
        image_path VARCHAR(255) NOT NULL,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('present', 'late') DEFAULT 'present',
        notes TEXT,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL
      )
    `);

    const [adminExists] = await connection.query(
      'SELECT * FROM users WHERE role = ? LIMIT 1',
      ['admin']
    );

    if (adminExists.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (school_id, name, password, role, is_temp_password) VALUES (?, ?, ?, ?, ?)',
        ['ADMIN001', 'System Administrator', hashedPassword, 'admin', false]
      );
      console.log('✅ Default admin created - School ID: ADMIN001, Password: admin123');
    }

    connection.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

export default pool;
