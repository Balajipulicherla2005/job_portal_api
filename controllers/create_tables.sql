-- Create tables for job portal registration system
-- Run this SQL script in your MySQL database to create the missing tables

-- Drop tables if they exist (optional - remove these lines if you want to keep existing data)
-- DROP TABLE IF EXISTS job_seeker_profiles;
-- DROP TABLE IF EXISTS employer_profiles;
-- DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('jobseeker', 'employer', 'admin') NOT NULL DEFAULT 'jobseeker',
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create job_seeker_profiles table
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  fullName VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  skills JSON DEFAULT NULL,
  experience JSON DEFAULT NULL,
  education JSON DEFAULT NULL,
  resume VARCHAR(255) DEFAULT NULL,
  profilePicture VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (userId),
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create employer_profiles table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  companyName VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  companySize VARCHAR(50) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  logo VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (userId),
  INDEX idx_userId (userId),
  INDEX idx_companyName (companyName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create jobs table (if needed)
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employerId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  jobType ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
  salaryMin DECIMAL(10,2) DEFAULT NULL,
  salaryMax DECIMAL(10,2) DEFAULT NULL,
  status ENUM('draft', 'active', 'closed', 'cancelled') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_employerId (employerId),
  INDEX idx_status (status),
  INDEX idx_jobType (jobType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create applications table (if needed)
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobId INT NOT NULL,
  jobSeekerId INT NOT NULL,
  coverLetter TEXT DEFAULT NULL,
  status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (jobSeekerId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (jobId, jobSeekerId),
  INDEX idx_jobId (jobId),
  INDEX idx_jobSeekerId (jobSeekerId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables were created
SHOW TABLES LIKE '%users%';
SHOW TABLES LIKE '%profiles%';
SHOW TABLES LIKE '%jobs%';
SHOW TABLES LIKE '%applications%';
