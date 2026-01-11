const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmployerProfile = sequelize.define('employer_profiles', {
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
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  companyWebsite: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  companySize: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = EmployerProfile;
