-- Job Portal Database Schema
-- MySQL Compatible

-- Drop tables if exist (in reverse order of dependencies)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS employer_profiles;
DROP TABLE IF EXISTS job_seeker_profiles;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('jobseeker', 'employer') NOT NULL DEFAULT 'jobseeker',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Seeker Profiles table
CREATE TABLE job_seeker_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  fullName VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(255),
  skills TEXT,
  experience TEXT,
  education TEXT,
  resumePath VARCHAR(500),
  bio TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employer Profiles table
CREATE TABLE employer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  companyName VARCHAR(255) NOT NULL,
  companyWebsite VARCHAR(255),
  companySize VARCHAR(50),
  industry VARCHAR(100),
  location VARCHAR(255),
  phone VARCHAR(20),
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs table
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employerId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  qualifications TEXT,
  responsibilities TEXT,
  jobType ENUM('full-time', 'part-time', 'contract', 'internship', 'temporary') DEFAULT 'full-time',
  location VARCHAR(255) NOT NULL,
  salaryMin DECIMAL(10, 2),
  salaryMax DECIMAL(10, 2),
  salaryPeriod ENUM('hourly', 'monthly', 'yearly') DEFAULT 'yearly',
  experienceLevel ENUM('entry', 'mid', 'senior', 'executive'),
  skills TEXT,
  benefits TEXT,
  status ENUM('active', 'closed', 'draft') DEFAULT 'active',
  applicationDeadline DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_employerId (employerId),
  INDEX idx_status (status),
  INDEX idx_jobType (jobType),
  INDEX idx_location (location(100)),
  FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications table
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobId INT NOT NULL,
  jobSeekerId INT NOT NULL,
  coverLetter TEXT,
  status ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (jobSeekerId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (jobId, jobSeekerId),
  INDEX idx_jobId (jobId),
  INDEX idx_jobSeekerId (jobSeekerId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('application_status', 'new_application', 'profile_update', 'system') DEFAULT 'system',
  relatedId INT,
  relatedType VARCHAR(50),
  isRead BOOLEAN DEFAULT FALSE,
  readAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
-- Sample employer user
INSERT INTO users (email, password, role) VALUES 
('employer@test.com', '$2a$10$example_hashed_password', 'employer'),
('jobseeker@test.com', '$2a$10$example_hashed_password', 'jobseeker');

-- Note: The passwords above are placeholders. Use bcrypt to hash actual passwords.
