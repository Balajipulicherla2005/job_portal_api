const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobSeekerProfile = sequelize.define('jobseeker_profiles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('skills');
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('skills', JSON.stringify(value));
      } else {
        this.setDataValue('skills', value);
      }
    }
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resumePath: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = JobSeekerProfile;
