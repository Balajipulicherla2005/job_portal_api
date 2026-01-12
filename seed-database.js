const { sequelize, User, JobSeekerProfile, EmployerProfile, Job, Application } = require('./models');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test data...\n');

    // Create Employer
    console.log('Creating employer...');
    const employer = await User.create({
      email: 'employer@techcorp.com',
      password: 'password123',
      role: 'employer'
    });

    await EmployerProfile.create({
      userId: employer.id,
      companyName: 'TechCorp Solutions',
      description: 'Leading technology company specializing in AI and ML solutions',
      phone: '555-0100',
      industry: 'Technology',
      companySize: '100-500',
      location: 'San Francisco, CA'
    });
    console.log('✓ Employer created');

    // Create some job seekers
    console.log('Creating job seekers...');
    const jobSeeker1 = await User.create({
      email: 'jane.dev@example.com',
      password: 'password123',
      role: 'jobseeker'
    });

    await JobSeekerProfile.create({
      userId: jobSeeker1.id,
      fullName: 'Jane Developer',
      phone: '555-0201',
      location: 'San Francisco, CA',
      skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Python']),
      experience: '5 years as Full Stack Developer',
      education: 'BS Computer Science, Stanford University'
    });

    const jobSeeker2 = await User.create({
      email: 'john.designer@example.com',
      password: 'password123',
      role: 'jobseeker'
    });

    await JobSeekerProfile.create({
      userId: jobSeeker2.id,
      fullName: 'John Designer',
      phone: '555-0202',
      location: 'New York, NY',
      skills: JSON.stringify(['UI/UX', 'Figma', 'Adobe XD', 'HTML/CSS']),
      experience: '3 years as UI/UX Designer',
      education: 'BA Design, NYU'
    });
    console.log('✓ Job seekers created');

    // Create Jobs
    console.log('Creating job listings...');
    const job1 = await Job.create({
      employerId: employer.id,
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our growing team.',
      qualifications: '5+ years experience with React and Node.js, Strong problem-solving skills',
      responsibilities: 'Develop and maintain web applications, Collaborate with cross-functional teams, Write clean, maintainable code',
      jobType: 'full-time',
      location: 'San Francisco, CA',
      salaryMin: 120000,
      salaryMax: 180000,
      salaryPeriod: 'yearly',
      experienceLevel: 'senior',
      skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS']),
      benefits: 'Health insurance, 401k, Stock options, Remote work',
      status: 'active',
      applicationDeadline: new Date('2026-03-31')
    });

    const job2 = await Job.create({
      employerId: employer.id,
      title: 'UI/UX Designer',
      description: 'Join our design team to create beautiful and intuitive user experiences.',
      qualifications: '3+ years in UI/UX design, Proficiency in Figma and Adobe Creative Suite',
      responsibilities: 'Design user interfaces, Create wireframes and prototypes, Conduct user research',
      jobType: 'full-time',
      location: 'San Francisco, CA',
      salaryMin: 90000,
      salaryMax: 130000,
      salaryPeriod: 'yearly',
      experienceLevel: 'mid',
      skills: JSON.stringify(['Figma', 'Adobe XD', 'Sketch', 'User Research']),
      benefits: 'Health insurance, Unlimited PTO, Professional development',
      status: 'active',
      applicationDeadline: new Date('2026-02-28')
    });

    const job3 = await Job.create({
      employerId: employer.id,
      title: 'Junior Frontend Developer',
      description: 'Great opportunity for a junior developer to grow their skills.',
      qualifications: '1+ year experience with React, Willingness to learn',
      responsibilities: 'Build UI components, Fix bugs, Participate in code reviews',
      jobType: 'full-time',
      location: 'Remote',
      salaryMin: 70000,
      salaryMax: 90000,
      salaryPeriod: 'yearly',
      experienceLevel: 'entry',
      skills: JSON.stringify(['React', 'JavaScript', 'HTML', 'CSS']),
      benefits: 'Health insurance, Remote work, Learning budget',
      status: 'active',
      applicationDeadline: new Date('2026-02-15')
    });
    console.log('✓ Jobs created');

    // Create Applications
    console.log('Creating applications...');
    await Application.create({
      jobId: job1.id,
      jobSeekerId: jobSeeker1.id,
      coverLetter: 'I am very interested in this position and believe my 5 years of experience with React and Node.js make me a great fit.',
      status: 'pending'
    });

    await Application.create({
      jobId: job2.id,
      jobSeekerId: jobSeeker2.id,
      coverLetter: 'I would love to bring my design expertise to your team. My experience with Figma and user research aligns perfectly with your needs.',
      status: 'reviewing'
    });
    console.log('✓ Applications created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 3 Users (1 employer, 2 job seekers)');
    console.log('   - 3 Job Listings');
    console.log('   - 2 Applications');
    console.log('\n🔐 Test Accounts:');
    console.log('   Employer: employer@techcorp.com / password123');
    console.log('   Job Seeker 1: jane.dev@example.com / password123');
    console.log('   Job Seeker 2: john.designer@example.com / password123');
    console.log('   Your Account: testuser@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
