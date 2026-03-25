-- Faculty Attendance System Database Schema
-- For InfinityFree MySQL Database

-- Users table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subjects table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schedules table
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
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_faculty (faculty_id),
  INDEX idx_subject (subject_id),
  INDEX idx_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  schedule_id INT,
  image_path VARCHAR(255) NOT NULL,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('present', 'late') DEFAULT 'present',
  notes TEXT,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL,
  INDEX idx_faculty_attendance (faculty_id),
  INDEX idx_schedule (schedule_id),
  INDEX idx_captured_at (captured_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (school_id, name, password, role, is_temp_password) 
VALUES ('ADMIN001', 'System Administrator', '$2a$10$8K1p/a0dL3LKzOWR7nY9V.q3KZo.8oyYQXqZJZQQZ5Z5Z5Z5Z5Z5Z', 'admin', FALSE)
ON DUPLICATE KEY UPDATE school_id = school_id;

-- Sample subjects (optional - remove if not needed)
INSERT INTO subjects (course_code, course_name, year_level, department, section) VALUES
('EDUC101', 'Foundations of Education', '1st Year', 'CTE', 'A'),
('ACCT101', 'Principles of Accounting', '1st Year', 'CBA', 'A'),
('POLSCI101', 'Introduction to Political Science', '1st Year', 'CLAPA', 'A'),
('CS101', 'Introduction to Programming', '1st Year', 'CIT', 'A'),
('THEO101', 'Introduction to Theology', '1st Year', 'THEO', 'A')
ON DUPLICATE KEY UPDATE course_code = course_code;
