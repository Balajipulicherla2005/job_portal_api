import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const JobSeekerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/jobseeker');
      setDashboard(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-container">
        <div className="error">Failed to load dashboard data</div>
      </div>
    );
  }

  const { statistics, recentApplications, recommendedJobs } = dashboard;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Job Seeker Dashboard</h1>
        <Link to="/job-seeker/profile" className="btn-secondary">
          Edit Profile
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{statistics.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{statistics.statusCounts.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card reviewing">
          <div className="stat-icon">👀</div>
          <div className="stat-content">
            <h3>{statistics.statusCounts.reviewing}</h3>
            <p>Under Review</p>
          </div>
        </div>

        <div className="stat-card shortlisted">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{statistics.statusCounts.shortlisted}</h3>
            <p>Shortlisted</p>
          </div>
        </div>

        <div className="stat-card accepted">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{statistics.statusCounts.accepted}</h3>
            <p>Accepted</p>
          </div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{statistics.statusCounts.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="profile-completion-card">
        <h2>Profile Completion</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${statistics.profileCompletion}%` }}
          ></div>
        </div>
        <p className="completion-text">
          {statistics.profileCompletion}% Complete
        </p>
        {statistics.profileCompletion < 100 && (
          <Link to="/job-seeker/profile" className="complete-profile-link">
            Complete Your Profile →
          </Link>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Recent Applications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <Link to="/job-seeker/applications" className="view-all-link">
              View All →
            </Link>
          </div>
          
          {recentApplications.length > 0 ? (
            <div className="applications-list">
              {recentApplications.map((application) => (
                <div key={application.id} className="application-item">
                  <div className="application-info">
                    <h3>{application.job.title}</h3>
                    <p className="company-name">
                      {application.job.employer.employerProfile.companyName}
                    </p>
                    <p className="location">{application.job.location}</p>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge ${application.status}`}>
                      {application.status}
                    </span>
                    <span className="application-date">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No applications yet</p>
              <Link to="/jobs" className="btn-primary">
                Browse Jobs
              </Link>
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recommended Jobs</h2>
            <Link to="/jobs" className="view-all-link">
              View All →
            </Link>
          </div>
          
          {recommendedJobs.length > 0 ? (
            <div className="jobs-list">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="job-item">
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <p className="company-name">
                      {job.employer.employerProfile.companyName}
                    </p>
                    <p className="location">{job.location}</p>
                    {job.salaryMin && job.salaryMax && (
                      <p className="salary">
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Link 
                    to={`/jobs/${job.id}`} 
                    className="btn-secondary btn-small"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recommended jobs available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/jobs" className="action-card">
            <span className="action-icon">🔍</span>
            <span className="action-text">Browse Jobs</span>
          </Link>
          <Link to="/job-seeker/applications" className="action-card">
            <span className="action-icon">📄</span>
            <span className="action-text">My Applications</span>
          </Link>
          <Link to="/job-seeker/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span className="action-text">Update Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
