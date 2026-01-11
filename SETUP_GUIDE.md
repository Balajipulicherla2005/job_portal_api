# Job Portal API - Setup and Testing Guide

## Features Implemented

Based on the PDF requirements, this Job Portal API includes all the following features:

### 1. User Authentication ✓
- User registration and login
- Secure password storage (bcrypt)
- JWT-based authentication
- Role-based access (job_seeker, employer)

### 2. Profile Management ✓
- Job seeker profiles (personal info, resume upload, contact details)
- Employer profiles (company information, contact details)
- Profile update functionality

### 3. Job Listings ✓
- Employers can create, edit, and delete job listings
- Job listings include: title, description, qualifications, responsibilities, location, salary range
- Job type and experience level filters
- Active/inactive status management

### 4. Job Search ✓
- Simple search functionality by keyword
- Filters: job type, location, salary range, experience level
- Pagination support

### 5. Job Application ✓
- Job seekers can apply for jobs
- Employers can view applications
- Application status management (pending, reviewed, accepted, rejected)

### 6. Dashboard ✓
- Separate dashboards for job seekers and employers
- Job seekers can track applied jobs
- Employers can manage job listings and view applications

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Database Setup

1. **Create MySQL Database:**
```sql
CREATE DATABASE job_portal;
```

2. **Configure Environment Variables:**

Edit the `.env` file with your database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=job_portal
DB_PORT=3306
JWT_SECRET=your_strong_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

## Installation

1. **Install Dependencies:**
```bash
cd /Users/hemanthreddy/Desktop/personal/job_portal_api
npm install
```

2. **Start the Server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

3. **Verify Server is Running:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-07T..."
}
```

## Database Tables

The application will automatically create the following tables:

1. **users** - User authentication and roles
2. **job_seeker_profiles** - Job seeker information
3. **employer_profiles** - Employer company information
4. **jobs** - Job listings
5. **applications** - Job applications

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Profile (`/api/profile`)
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update profile (protected)
- `POST /api/profile/upload-resume` - Upload resume (job seekers only)

### Jobs (`/api/jobs`)
- `GET /api/jobs` - Get all jobs (public, with search/filters)
- `GET /api/jobs/:id` - Get job by ID (public)
- `POST /api/jobs` - Create job (employers only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs (employers only)
- `PUT /api/jobs/:id` - Update job (employers only)
- `DELETE /api/jobs/:id` - Delete job (employers only)

### Applications (`/api/applications`)
- `POST /api/applications` - Apply for job (job seekers only)
- `GET /api/applications/my-applications` - Get user's applications (job seekers only)
- `GET /api/applications/job/:jobId` - Get job applications (employers only)
- `PUT /api/applications/:id/status` - Update application status (employers only)

## Testing the API

### 1. Register a Job Seeker
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jobseeker@example.com",
    "password": "password123",
    "role": "job_seeker",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Register an Employer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@example.com",
    "password": "password123",
    "role": "employer",
    "companyName": "Tech Corp",
    "contactPerson": "Jane Smith"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### 4. Create a Job (Employer)
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Senior Full Stack Developer",
    "description": "We are looking for an experienced Full Stack Developer",
    "qualifications": "5+ years experience with React and Node.js",
    "responsibilities": "Design and develop web applications",
    "location": "San Francisco, CA",
    "jobType": "full-time",
    "experienceLevel": "senior",
    "salaryMin": 120000,
    "salaryMax": 180000,
    "skills": "React, Node.js, MySQL, AWS"
  }'
```

### 5. Search Jobs
```bash
# Basic search
curl "http://localhost:5000/api/jobs"

# With filters
curl "http://localhost:5000/api/jobs?keyword=developer&location=San%20Francisco&jobType=full-time"
```

### 6. Apply for a Job (Job Seeker)
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN" \
  -d '{
    "jobId": 1,
    "coverLetter": "I am very interested in this position..."
  }'
```

### 7. View Applications (Employer)
```bash
curl -X GET "http://localhost:5000/api/applications/job/1" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN"
```

## Common Issues and Solutions

### Issue 1: Database Connection Error
**Solution:** 
- Verify MySQL is running: `mysql -u root -p`
- Check `.env` file credentials
- Ensure `job_portal` database exists

### Issue 2: JWT Token Errors
**Solution:**
- Ensure JWT_SECRET is set in `.env`
- Check token format in Authorization header: `Bearer <token>`
- Token expires after 30 days by default

### Issue 3: File Upload Issues
**Solution:**
- Ensure `uploads` directory exists and has write permissions
- Check file size limits in multer configuration

### Issue 4: Port Already in Use
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env file
```

## File Structure
```
job_portal_api/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── jobController.js     # Job CRUD operations
│   ├── applicationController.js # Application management
│   └── profileController.js # Profile management
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── upload.js           # File upload middleware
├── models/
│   ├── User.js             # User model
│   ├── JobSeekerProfile.js # Job seeker profile model
│   ├── EmployerProfile.js  # Employer profile model
│   ├── Job.js              # Job model
│   ├── Application.js      # Application model
│   └── index.js            # Model associations
├── routes/
│   ├── auth.js             # Auth routes
│   ├── jobs.js             # Job routes
│   ├── applications.js     # Application routes
│   └── profile.js          # Profile routes
├── uploads/                # Uploaded files directory
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── server.js               # Application entry point
└── package.json            # Dependencies
```

## Next Steps

1. **Test Frontend Integration**
   - Ensure frontend React app can connect to API
   - Test all user flows end-to-end

2. **Add Additional Features**
   - Email notifications
   - Advanced search with saved searches
   - Job recommendations
   - Company reviews

3. **Production Deployment**
   - Set strong JWT_SECRET
   - Use environment-specific .env files
   - Enable HTTPS
   - Set up proper logging
   - Configure CORS for production domain

## Support

For issues or questions, contact: support@amdox.in
