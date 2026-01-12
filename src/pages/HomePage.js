import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, totalEmployers: 0, totalApplications: 0 });
  const navigate = useNavigate();
  const { isAuthenticated, isJobSeeker, isEmployer } = useAuth();

  useEffect(() => {
    fetchRecentJobs();
    fetchStats();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const response = await api.get('/jobs?limit=6');
      if (response.data.success) {
        setRecentJobs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (isJobSeeker) {
        navigate('/jobs');
      } else if (isEmployer) {
        navigate('/employer/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Dream Job</h1>
          <p className="hero-subtitle">
            Connect with top employers and discover opportunities that match your skills
          </p>
          <button className="hero-button" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h3>{stats.totalJobs}</h3>
            <p>Job Listings</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalEmployers}</h3>
            <p>Companies</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalApplications}</h3>
            <p>Applications</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose JobPortal?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Easy Job Search</h3>
            <p>Find jobs with advanced filters including location, job type, and salary range</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Profile Management</h3>
            <p>Create and manage your professional profile with resume upload</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Apply</h3>
            <p>Apply to jobs directly through the portal with one click</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Applications</h3>
            <p>Monitor your application status in real-time</p>
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="recent-jobs-section">
        <h2 className="section-title">Recent Job Openings</h2>
        {loading ? (
          <p className="loading-text">Loading jobs...</p>
        ) : recentJobs.length > 0 ? (
          <div className="jobs-grid">
            {recentJobs.map((job) => (
              <div key={job.id} className="job-card">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.employer?.employerProfile?.companyName || 'Company'}</p>
                <p className="job-location">📍 {job.location}</p>
                <p className="job-type">{job.jobType}</p>
                {(job.salaryMin && job.salaryMax) && (
                  <p className="job-salary">💰 ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}</p>
                )}
                <Link to={`/jobs/${job.id}`} className="job-link">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-jobs-text">No jobs available at the moment.</p>
        )}
        <div className="view-all-container">
          <Link to="/jobs" className="view-all-button">
            View All Jobs
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of job seekers and employers on JobPortal</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">
              Sign Up Now
            </Link>
            <Link to="/jobs" className="cta-button secondary">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
