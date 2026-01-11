-- Job Portal Database Setup Script (Updated to match Sequelize models)
-- Drop database if exists (be careful in production!)
DROP DATABASE IF EXISTS job_portal;

-- Create database
CREATE DATABASE job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE job_portal;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('job_seeker', 'employer') NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: job_seeker_profiles
-- ============================================
CREATE TABLE job_seeker_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zipCode VARCHAR(20),
    resume VARCHAR(255),
    skills TEXT,
    experience TEXT,
    education TEXT,
    bio TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: employer_profiles
-- ============================================
CREATE TABLE employer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    companyName VARCHAR(255) NOT NULL,
    contactPerson VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    companyEmail VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zipCode VARCHAR(20),
    description TEXT,
    industry VARCHAR(100),
    companySize VARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_companyName (companyName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: jobs
-- ============================================
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
    applicationDeadline DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employerId (employerId),
    INDEX idx_title (title),
    INDEX idx_location (location),
    INDEX idx_jobType (jobType),
    INDEX idx_status (status),
    FULLTEXT INDEX idx_fulltext_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: applications
-- ============================================
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobId INT NOT NULL,
    jobSeekerId INT NOT NULL,
    coverLetter TEXT,
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (jobSeekerId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (jobId, jobSeekerId),
    INDEX idx_jobId (jobId),
    INDEX idx_jobSeekerId (jobSeekerId),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Database Information
-- ============================================
SELECT 'Database setup completed successfully!' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'job_portal';
