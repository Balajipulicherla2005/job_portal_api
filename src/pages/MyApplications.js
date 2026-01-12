import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
      case 'approved':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status?.toLowerCase() === filter;
  });

  return (
    <div className="applications-page">
      <div className="applications-container">
        <h1 className="page-title">My Applications</h1>

        {loading ? (
          <p className="loading-text">Loading applications...</p>
        ) : (
          <>
            {/* Filter */}
            <div className="filter-section">
              <button
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({applications.length})
              </button>
              <button
                className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending (
                {applications.filter((a) => a.status?.toLowerCase() === 'pending').length})
              </button>
              <button
                className={`filter-button ${filter === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilter('accepted')}
              >
                Accepted (
                {applications.filter((a) => a.status?.toLowerCase() === 'accepted').length})
              </button>
              <button
                className={`filter-button ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                Rejected (
                {applications.filter((a) => a.status?.toLowerCase() === 'rejected').length})
              </button>
            </div>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
              <div className="applications-list">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="application-header">
                      <div>
                        <h2 className="application-title">{application.job_title}</h2>
                        <p className="application-company">{application.companyName}</p>
                      </div>
                      <span className={`status-badge ${getStatusClass(application.status)}`}>
                        {application.status || 'Pending'}
                      </span>
                    </div>

                    <div className="application-details">
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span>{application.job_location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Job Type:</span>
                        <span>{application.job_type}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Applied on:</span>
                        <span>{new Date(application.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="application-footer">
                      <Link to={`/jobs/${application.jobId}`} className="view-job-button">
                        View Job Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  {filter === 'all'
                    ? "You haven't applied to any jobs yet."
                    : `No ${filter} applications found.`}
                </p>
                {filter === 'all' && (
                  <Link to="/jobs" className="browse-jobs-button">
                    Browse Jobs
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
