const { sequelize } = require('./config/database');

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database to fix ENUM values...\n');
    
    // Disable foreign key checks temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks');
    
    // Drop tables in correct order (children first)
    await sequelize.query('DROP TABLE IF EXISTS notifications');
    await sequelize.query('DROP TABLE IF EXISTS applications');
    await sequelize.query('DROP TABLE IF EXISTS jobs');
    await sequelize.query('DROP TABLE IF EXISTS employer_profiles');
    await sequelize.query('DROP TABLE IF EXISTS jobseeker_profiles');
    await sequelize.query('DROP TABLE IF EXISTS job_seeker_profiles');
    await sequelize.query('DROP TABLE IF EXISTS users');
    console.log('✓ Dropped all tables');
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Re-enabled foreign key checks');
    
    // Sync all models to recreate tables with correct schema
    await sequelize.sync({ force: true });
    console.log('✓ All tables recreated with correct schema\n');
    
    console.log('✅ Database reset complete!');
    console.log('📋 Tables created:');
    console.log('   - users (with role: jobseeker, employer)');
    console.log('   - jobseeker_profiles');
    console.log('   - employer_profiles');
    console.log('   - jobs');
    console.log('   - applications');
    console.log('   - notifications\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

resetDatabase();
