# Job Portal API

Backend API for the Job Listing Portal built with Node.js, Express, and MySQL.

## Features

- **User Authentication**: JWT-based secure authentication
- **Role-based Access Control**: Separate functionality for Job Seekers and Employers
- **Profile Management**: Complete profiles for both job seekers and employers
- **Job Listings**: Create, edit, delete job postings with detailed information
- **Job Search**: Advanced search with filters (type, location, salary, keyword)
- **Job Applications**: Apply for jobs, track applications, manage candidates
- **Resume Upload**: Job seekers can upload and manage resumes
- **Dashboards**: Separate dashboards for job seekers and employers
- **Notifications**: Real-time notifications for application status updates

## Project Structure

```
job_portal_api/
├── config/            # Configuration constants
├── controllers/       # Request handlers
├── middleware/        # Auth and validation middleware
├── routes/            # API route definitions
├── utils/             # Utility functions
├── validators/        # Input validation
├── uploads/           # Uploaded files (resumes)
├── aiven-certs/       # SSL certificates for cloud DB
├── db.js              # Database connection pool
├── server.js          # Application entry point
└── DATABASE_SCHEMA.sql # Database schema
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher) or Aiven Cloud MySQL
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create MySQL database and run schema:
```bash
# Option 1: Use setup script
node setup-database.js

# Option 2: Manual setup
mysql -u root -p < DATABASE_SCHEMA.sql
```

3. Configure environment variables:
Copy `.env.example` to `.env` and update:
```env
PORT=5002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=job_portal
DB_PORT=3306
DB_SSL=false
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5002`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Profile Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/profile/job-seeker` | Get job seeker profile | Job Seeker |
| PUT | `/api/profile/job-seeker` | Update job seeker profile | Job Seeker |
| GET | `/api/profile/employer` | Get employer profile | Employer |
| PUT | `/api/profile/employer` | Update employer profile | Employer |

### Jobs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/jobs` | Get all jobs (with filters) | Public |
| GET | `/api/jobs/:id` | Get job by ID | Public |
| POST | `/api/jobs` | Create new job | Employer |
| GET | `/api/jobs/employer/my-jobs` | Get employer's jobs | Employer |
| PUT | `/api/jobs/:id` | Update job | Employer |
| DELETE | `/api/jobs/:id` | Delete job | Employer |

### Applications
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/applications/apply` | Apply for a job | Job Seeker |
| GET | `/api/applications/my-applications` | Get user's applications | Job Seeker |
| DELETE | `/api/applications/:id` | Withdraw application | Job Seeker |
| GET | `/api/applications/job/:jobId` | Get job applications | Employer |
| PUT | `/api/applications/:id/status` | Update application status | Employer |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/job-seeker` | Job seeker dashboard | Job Seeker |
| GET | `/api/dashboard/employer` | Employer dashboard | Employer |

### Statistics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/stats` | Get platform statistics | Public |

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Security**: Helmet, express-rate-limit
- **Logging**: Morgan
- **CORS**: cors middleware

## License

ISC
