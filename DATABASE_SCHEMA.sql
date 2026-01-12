-- ====================================================================
-- JOB PORTAL - COMPLETE DATABASE SCHEMA - MySQL
-- ====================================================================

DROP DATABASE IF EXISTS job_portal;
CREATE DATABASE job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_portal;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('jobseeker', 'employer') NOT NULL,
    isActive TINYINT(1) DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Job Seeker Profiles
CREATE TABLE jobseeker_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    fullName VARCHAR(255),
    phone VARCHAR(20),
    location VARCHAR(255),
    skills JSON,
    experience TEXT,
    education TEXT,
    resumePath VARCHAR(500),
    bio TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Employer Profiles
CREATE TABLE employer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    companyName VARCHAR(255),
    companyDescription TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    companySize VARCHAR(50),
    location VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employerId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    qualifications TEXT,
    responsibilities TEXT,
    jobType ENUM('full-time', 'part-time', 'contract', 'internship', 'temporary') NOT NULL,
    location VARCHAR(255) NOT NULL,
    salaryMin DECIMAL(10, 2),
    salaryMax DECIMAL(10, 2),
    salaryPeriod ENUM('hour', 'month', 'year') DEFAULT 'year',
    experienceLevel ENUM('entry', 'mid', 'senior', 'executive'),
    skills JSON,
    benefits TEXT,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    applicationDeadline DATE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobId INT NOT NULL,
    jobSeekerId INT NOT NULL,
    coverLetter TEXT,
    status ENUM('pending', 'reviewing', 'shortlisted', 'accepted', 'rejected') DEFAULT 'pending',
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (jobSeekerId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (jobId, jobSeekerId)
);

-- Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type ENUM('application_status_change', 'new_application', 'job_posted', 'profile_view') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    relatedId INT,
    relatedType VARCHAR(50),
    isRead TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
