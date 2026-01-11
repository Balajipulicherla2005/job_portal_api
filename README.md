# Job Portal API

Backend API for the Job Listing Portal built with Node.js, Express, and MySQL.

## Features

- User authentication (JWT-based)
- Role-based access control (Job Seekers and Employers)
- Profile management for both roles
- Job CRUD operations
- Advanced job search with filters
- Job application system
- Resume upload for job seekers
- Application status management

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a MySQL database:
```sql
CREATE DATABASE job_portal;
```

3. Configure environment variables:
Copy `.env.example` to `.env` and update the values:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=job_portal
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Profile Management
- `GET /api/profile/job-seeker` - Get job seeker profile (Job Seeker only)
- `PUT /api/profile/job-seeker` - Update job seeker profile (Job Seeker only)
- `GET /api/profile/employer` - Get employer profile (Employer only)
- `PUT /api/profile/employer` - Update employer profile (Employer only)

### Jobs
- `GET /api/jobs` - Get all jobs with filters (Public)
- `GET /api/jobs/:id` - Get job by ID (Public)
- `POST /api/jobs` - Create a new job (Employer only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs (Employer only)
- `PUT /api/jobs/:id` - Update a job (Employer only)
- `DELETE /api/jobs/:id` - Delete a job (Employer only)

### Applications
- `POST /api/applications/apply` - Apply for a job (Job Seeker only)
- `GET /api/applications/my-applications` - Get user's applications (Job Seeker only)
- `DELETE /api/applications/:id` - Withdraw application (Job Seeker only)
- `GET /api/applications/job/:jobId` - Get applications for a job (Employer only)
- `PUT /api/applications/:id/status` - Update application status (Employer only)

## Database Schema

### Users
- id (Primary Key)
- email (Unique)
- password (Hashed)
- role (job_seeker | employer)
- isActive
- timestamps

### Job Seeker Profiles
- id (Primary Key)
- userId (Foreign Key)
- firstName, lastName
- phone, address, city, state, country, zipCode
- resume (File path)
- skills, experience, education, bio
- timestamps

### Employer Profiles
- id (Primary Key)
- userId (Foreign Key)
- companyName, contactPerson
- phone, companyEmail, website
- address, city, state, country, zipCode
- description, industry, companySize
- timestamps

### Jobs
- id (Primary Key)
- employerId (Foreign Key)
- title, description
- qualifications, responsibilities
- jobType, location
- salaryMin, salaryMax, salaryPeriod
- experienceLevel, skills, benefits
- status (active | closed | draft)
- applicationDeadline
- timestamps

### Applications
- id (Primary Key)
- jobId (Foreign Key)
- jobSeekerId (Foreign Key)
- coverLetter
- status (pending | reviewed | shortlisted | rejected | accepted)
- notes
- timestamps

## Technologies Used

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads
- Morgan for logging
- CORS

## License

ISC
