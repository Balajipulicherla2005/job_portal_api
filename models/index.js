const { sequelize } = require('../config/database');
const User = require('./User.model');
const JobSeekerProfile = require('./JobSeekerProfile');
const EmployerProfile = require('./EmployerProfile');
const Job = require('./Job.model');
const Application = require('./Application.model');
const Notification = require('./Notification.model');

// Define relationships
// User has one JobSeekerProfile
User.hasOne(JobSeekerProfile, {
  foreignKey: 'userId',
  as: 'jobSeekerProfile',
  onDelete: 'CASCADE'
});
JobSeekerProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User has one EmployerProfile
User.hasOne(EmployerProfile, {
  foreignKey: 'userId',
  as: 'employerProfile',
  onDelete: 'CASCADE'
});
EmployerProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User (Employer) has many Jobs
User.hasMany(Job, {
  foreignKey: 'employerId',
  as: 'jobs',
  onDelete: 'CASCADE'
});
Job.belongsTo(User, {
  foreignKey: 'employerId',
  as: 'employer'
});

// Job has many Applications
Job.hasMany(Application, {
  foreignKey: 'jobId',
  as: 'applications',
  onDelete: 'CASCADE'
});
Application.belongsTo(Job, {
  foreignKey: 'jobId',
  as: 'job'
});

// User (JobSeeker) has many Applications
User.hasMany(Application, {
  foreignKey: 'jobSeekerId',
  as: 'applications',
  onDelete: 'CASCADE'
});
Application.belongsTo(User, {
  foreignKey: 'jobSeekerId',
  as: 'jobSeeker'
});

// User has many Notifications
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE'
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Sync database (creates tables if they don't exist)
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✓ Database models synchronized successfully');
  } catch (error) {
    console.error('✗ Error synchronizing database models:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  JobSeekerProfile,
  EmployerProfile,
  Job,
  Application,
  Notification,
  syncDatabase
};
