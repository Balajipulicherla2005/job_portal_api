# Job Portal Frontend - Setup and Testing Guide

## Features Implemented

This React frontend implements all features from the PDF requirements:

### 1. User Authentication ✓
- User registration (job seeker and employer)
- Login/Logout functionality
- Protected routes with authentication
- JWT token management

### 2. Profile Management ✓
- Job seeker profile with personal information
- Resume upload functionality
- Employer profile with company details
- Profile editing capabilities

### 3. Job Listings ✓
- Browse all active job listings
- View detailed job information
- Employer can create, edit, and delete jobs
- Real-time status updates

### 4. Job Search & Filters ✓
- Keyword search
- Filter by job type (Full-time, Part-time, Contract, Internship)
- Filter by location
- Salary range filters
- Pagination support

### 5. Job Application ✓
- Job seekers can apply to jobs
- Application form with cover letter
- Track application status
- Employers can view and manage applications

### 6. Dashboards ✓
- Job seeker dashboard (track applications, profile management)
- Employer dashboard (manage jobs, view applications)
- Statistics and quick actions
- Recent activity tracking

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. **Navigate to Frontend Directory:**
```bash
cd /Users/hemanthreddy/Desktop/personal/job_portal_app
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Create Environment File:**
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start Development Server:**
```bash
npm start
```

The application will open at http://localhost:3000

## Project Structure

```
job_portal_app/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.js          # Navigation bar
│   │   │   ├── Footer.js          # Footer component
│   │   │   └── Loading.js         # Loading spinner
│   │   └── PrivateRoute.js        # Protected route wrapper
│   ├── context/
│   │   └── AuthContext.js         # Authentication context
│   ├── pages/
│   │   ├── Home.js                # Landing page
│   │   ├── Login.js               # Login page
│   │   ├── Register.js            # Registration page
│   │   ├── JobList.js             # Job listings with search
│   │   ├── JobDetails.js          # Job detail view
│   │   ├── CreateJob.js           # Create job (employer)
│   │   ├── EditJob.js             # Edit job (employer)
│   │   ├── MyJobs.js              # Employer job management
│   │   ├── JobApplications.js     # View applications (employer)
│   │   ├── MyApplications.js      # Track applications (job seeker)
│   │   ├── JobSeekerDashboard.js  # Job seeker dashboard
│   │   ├── EmployerDashboard.js   # Employer dashboard
│   │   ├── JobSeekerProfile.js    # Job seeker profile
│   │   └── EmployerProfile.js     # Employer profile
│   ├── services/
│   │   └── api.js                 # API service layer
│   ├── App.js                     # Main app component
│   ├── App.css                    # Global styles
│   ├── index.js                   # App entry point
│   └── index.css                  # Base styles
├── package.json
└── README.md
```

## Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/jobs` - Browse jobs
- `/jobs/:id` - Job details

### Protected Routes (Job Seekers)
- `/dashboard/jobseeker` - Job seeker dashboard
- `/profile/jobseeker` - Job seeker profile
- `/my-applications` - Track applications

### Protected Routes (Employers)
- `/dashboard/employer` - Employer dashboard
- `/profile/employer` - Employer profile
- `/create-job` - Create new job
- `/edit-job/:id` - Edit job
- `/my-jobs` - Manage jobs
- `/job-applications/:jobId` - View job applications

## Testing the Application

### Test Flow 1: Job Seeker Journey

1. **Register as Job Seeker**
   - Go to http://localhost:3000/register
   - Select "Job Seeker" role
   - Fill in: email, password, first name, last name
   - Click "Register"
   - You should be redirected to job seeker dashboard

2. **Complete Profile**
   - Click "Profile" in navigation
   - Add phone number, location, bio
   - Upload resume (PDF, DOC, DOCX)
   - Add skills
   - Click "Save Changes"

3. **Search for Jobs**
   - Go to "Browse Jobs"
   - Use search filters (keyword, location, job type)
   - Click on a job to view details

4. **Apply for a Job**
   - On job details page, click "Apply Now"
   - Write cover letter
   - Submit application
   - Check "My Applications" to track status

5. **Check Dashboard**
   - View application statistics
   - See recent applications
   - Quick access to profile

### Test Flow 2: Employer Journey

1. **Register as Employer**
   - Go to http://localhost:3000/register
   - Select "Employer" role
   - Fill in: email, password, company name, contact person
   - Click "Register"
   - You should be redirected to employer dashboard

2. **Complete Company Profile**
   - Click "Profile" in navigation
   - Add company description
   - Add phone, website, address
   - Upload company logo (optional)
   - Click "Save Changes"

3. **Create Job Posting**
   - Click "Post a Job" or go to "/create-job"
   - Fill in job details:
     * Job title
     * Description
     * Qualifications
     * Responsibilities
     * Location
     * Job type
     * Experience level
     * Salary range
     * Required skills
   - Click "Post Job"

4. **Manage Jobs**
   - Go to "My Jobs"
   - View all posted jobs
   - Edit or delete jobs
   - Toggle job status (active/inactive)

5. **Review Applications**
   - Click "View Applications" on any job
   - Review candidate profiles
   - Update application status:
     * Pending
     * Reviewed
     * Accepted
     * Rejected
   - Contact candidates

6. **Check Dashboard**
   - View job posting statistics
   - See application counts
   - Quick actions (post job, view applications)

## Features by User Role

### Job Seeker Features
- ✓ Create and manage profile
- ✓ Upload and update resume
- ✓ Search jobs with multiple filters
- ✓ Apply to multiple jobs
- ✓ Track application status
- ✓ View job details and company info
- ✓ Dashboard with statistics
- ✓ Withdraw applications

### Employer Features
- ✓ Create company profile
- ✓ Post unlimited job listings
- ✓ Edit and delete jobs
- ✓ View all applications per job
- ✓ Review candidate profiles and resumes
- ✓ Update application status
- ✓ Dashboard with hiring analytics
- ✓ Manage job status (active/inactive)

## Common Issues and Solutions

### Issue 1: "Network Error" when making API calls
**Solution:**
- Ensure backend server is running on port 5000
- Check `.env` file has correct API_URL
- Verify CORS is enabled in backend

### Issue 2: Authentication not persisting
**Solution:**
- Check browser localStorage
- Ensure JWT token is being saved
- Verify token expiration time

### Issue 3: File upload not working
**Solution:**
- Check file size (max 5MB)
- Verify file type (PDF, DOC, DOCX for resumes)
- Ensure backend uploads directory exists

### Issue 4: "Cannot read property of undefined"
**Solution:**
- Check AuthContext is properly wrapped around app
- Verify API responses match expected structure
- Check console for detailed error messages

### Issue 5: Styling issues
**Solution:**
- Clear browser cache
- Check if CSS files are imported
- Verify className props are correct

## API Integration

The frontend communicates with the backend through the `api.js` service file:

```javascript
// Example: Get all jobs with filters
import { jobAPI } from './services/api';

const fetchJobs = async () => {
  const response = await jobAPI.getAllJobs({
    keyword: 'developer',
    location: 'San Francisco',
    jobType: 'full-time'
  });
  console.log(response.data);
};
```

## Build for Production

```bash
# Create optimized production build
npm run build

# The build folder will contain optimized files
# Deploy the contents of the build folder to your hosting service
```

## Environment Variables

Create `.env.production` for production builds:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Next Steps

1. **Enhance UI/UX**
   - Add animations and transitions
   - Improve mobile responsiveness
   - Add dark mode toggle

2. **Additional Features**
   - Saved searches
   - Job recommendations
   - Email notifications
   - Chat functionality
   - Advanced filters

3. **Performance Optimization**
   - Implement lazy loading
   - Add pagination for large lists
   - Optimize images
   - Add service worker for offline support

4. **Testing**
   - Write unit tests
   - Add integration tests
   - Implement E2E tests with Cypress

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Support

For issues or questions, contact: support@amdox.in

---

## Quick Start Checklist

- [ ] Backend API is running on http://localhost:5000
- [ ] MySQL database is created and configured
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file created with API_URL
- [ ] Development server started (`npm start`)
- [ ] Tested registration for both user types
- [ ] Tested job posting and application flow
- [ ] Verified all features from PDF requirements

## PDF Requirements Verification

All features from the PDF document have been implemented:

✅ **1. User Authentication**
- User registration and login
- Secure password storage and authentication

✅ **2. Profile Management**
- Job seeker profiles with personal information, resume upload, contact details
- Employer profiles with company information and contact details

✅ **3. Job Listings**
- Employers can create, edit, and delete job listings
- Job listings include title, description, qualifications, responsibilities, location, salary range

✅ **4. Job Search**
- Simple search functionality for job seekers
- Basic search filters (job type, location, keyword)

✅ **5. Job Application**
- Job seekers can apply for jobs directly through portal
- Employers can view applications and manage candidates

✅ **6. Dashboard**
- Separate dashboards for job seekers and employers
- Job seekers can track applied jobs and update profiles
- Employers can manage job listings and view applications
