import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Context
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import PrivateRoute from './components/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import JobSeekerProfile from './pages/JobSeekerProfile';
import EmployerProfile from './pages/EmployerProfile';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import JobApplications from './pages/JobApplications';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Job Seeker Routes */}
            <Route
              path="/job-seeker/dashboard"
              element={
                <PrivateRoute userType="jobseeker">
                  <JobSeekerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/job-seeker/profile"
              element={
                <PrivateRoute userType="jobseeker">
                  <JobSeekerProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/job-seeker/applications"
              element={
                <PrivateRoute userType="jobseeker">
                  <MyApplications />
                </PrivateRoute>
              }
            />

            {/* Notifications Route - All Authenticated Users */}
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              }
            />

            {/* Employer Routes */}
            <Route
              path="/employer/dashboard"
              element={
                <PrivateRoute userType="employer">
                  <EmployerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employer/profile"
              element={
                <PrivateRoute userType="employer">
                  <EmployerProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/employer/jobs"
              element={
                <PrivateRoute userType="employer">
                  <MyJobs />
                </PrivateRoute>
              }
            />
            <Route
              path="/employer/jobs/create"
              element={
                <PrivateRoute userType="employer">
                  <CreateJob />
                </PrivateRoute>
              }
            />
            <Route
              path="/employer/jobs/edit/:id"
              element={
                <PrivateRoute userType="employer">
                  <EditJob />
                </PrivateRoute>
              }
            />
            <Route
              path="/employer/jobs/:id/applications"
              element={
                <PrivateRoute userType="employer">
                  <JobApplications />
                </PrivateRoute>
              }
            />

            {/* Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
