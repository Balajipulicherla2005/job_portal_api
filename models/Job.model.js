const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('jobs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  qualifications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'temporary'),
    defaultValue: 'full-time'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  salaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryPeriod: {
    type: DataTypes.ENUM('hourly', 'monthly', 'yearly'),
    defaultValue: 'yearly'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'mid', 'senior', 'executive'),
    allowNull: true
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('skills');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('skills', JSON.stringify(value));
    }
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'closed', 'draft'),
    defaultValue: 'active'
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Job;
