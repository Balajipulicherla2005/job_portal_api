const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
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
    allowNull: true,
    get() {
      const value = this.getDataValue('qualifications');
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    },
    set(value) {
      this.setDataValue('qualifications', JSON.stringify(value || []));
    }
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('responsibilities');
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    },
    set(value) {
      this.setDataValue('responsibilities', JSON.stringify(value || []));
    }
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'temporary'),
    allowNull: false,
    defaultValue: 'full-time'
  },
  salaryRange: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('salaryRange');
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    },
    set(value) {
      if (value && typeof value === 'object') {
        this.setDataValue('salaryRange', JSON.stringify(value));
      } else {
        this.setDataValue('salaryRange', value);
      }
    }
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
        return [];
      }
    },
    set(value) {
      this.setDataValue('skills', JSON.stringify(value || []));
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'closed', 'draft'),
    allowNull: false,
    defaultValue: 'active'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'jobs',
  timestamps: true
});

module.exports = Job;
