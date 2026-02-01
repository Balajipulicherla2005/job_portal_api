import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const EmployerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/employer');
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

  const { statistics, recentApplications, recentJobs } = dashboard;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Employer Dashboard</h1>
        <Link to="/employer/jobs/create" className="btn-primary">
          + Post New Job
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{statistics.totalJobs}</h3>
            <p>Total Jobs Posted</p>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{statistics.jobStatusCounts.active}</h3>
            <p>Active Jobs</p>
          </div>
        </div>

        <div className="stat-card draft">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{statistics.jobStatusCounts.draft}</h3>
            <p>Draft Jobs</p>
          </div>
        </div>

        <div className="stat-card closed">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <h3>{statistics.jobStatusCounts.closed}</h3>
            <p>Closed Jobs</p>
          </div>
        </div>

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
            <h3>{statistics.applicationStatusCounts.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="profile-completion-card">
        <h2>Company Profile Completion</h2>
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
          <Link to="/employer/profile" className="complete-profile-link">
            Complete Your Company Profile →
          </Link>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Recent Applications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <Link to="/employer/jobs" className="view-all-link">
              View All →
            </Link>
          </div>
          
          {recentApplications.length > 0 ? (
            <div className="applications-list">
              {recentApplications.map((application) => (
                <div key={application.id} className="application-item">
                  <div className="application-info">
                    <h3>{application.jobSeeker.jobSeekerProfile.fullName}</h3>
                    <p className="job-title">
                      Applied for: {application.job.title}
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
              <Link to="/employer/jobs/create" className="btn-primary">
                Post a Job
              </Link>
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Job Postings</h2>
            <Link to="/employer/jobs" className="view-all-link">
              View All →
            </Link>
          </div>
          
          {recentJobs.length > 0 ? (
            <div className="jobs-list">
              {recentJobs.map((job) => (
                <div key={job.id} className="job-item">
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <p className="location">{job.location}</p>
                    <p className="job-type">
                      <span className={`type-badge ${job.jobType}`}>
                        {job.jobType}
                      </span>
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                    </p>
                    <p className="job-date">
                      Posted: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="job-actions">
                    <Link 
                      to={`/employer/jobs/${job.id}/applications`} 
                      className="btn-secondary btn-small"
                    >
                      View Applications
                    </Link>
                    <Link 
                      to={`/employer/jobs/edit/${job.id}`} 
                      className="btn-link"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No jobs posted yet</p>
              <Link to="/employer/jobs/create" className="btn-primary">
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="status-breakdown">
        <h2>Application Status Overview</h2>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-count">{statistics.applicationStatusCounts.pending}</div>
            <div className="status-label">Pending</div>
          </div>
          <div className="status-item">
            <div className="status-count">{statistics.applicationStatusCounts.reviewing}</div>
            <div className="status-label">Reviewing</div>
          </div>
          <div className="status-item">
            <div className="status-count">{statistics.applicationStatusCounts.shortlisted}</div>
            <div className="status-label">Shortlisted</div>
          </div>
          <div className="status-item">
            <div className="status-count">{statistics.applicationStatusCounts.rejected}</div>
            <div className="status-label">Rejected</div>
          </div>
          <div className="status-item">
            <div className="status-count">{statistics.applicationStatusCounts.accepted}</div>
            <div className="status-label">Accepted</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/employer/jobs/create" className="action-card">
            <span className="action-icon">➕</span>
            <span className="action-text">Post New Job</span>
          </Link>
          <Link to="/employer/jobs" className="action-card">
            <span className="action-icon">💼</span>
            <span className="action-text">Manage Jobs</span>
          </Link>
          <Link to="/employer/profile" className="action-card">
            <span className="action-icon">🏢</span>
            <span className="action-text">Company Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
