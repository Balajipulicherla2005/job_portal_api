import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './JobApplications.css';

const JobApplications = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobAndApplications();
  }, [id]);

  const fetchJobAndApplications = async () => {
    try {
      const [jobResponse, applicationsResponse] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/employer/jobs/${id}/applications`),
      ]);

      setJob(jobResponse.data);
      setApplications(applicationsResponse.data.applications || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status: newStatus });
      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      fetchJobAndApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
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

  if (loading) {
    return <div className="loading-container">Loading applications...</div>;
  }

  return (
    <div className="job-applications-page">
      <div className="job-applications-container">
        {/* Job Info */}
        {job && (
          <div className="job-info-section">
            <h1 className="page-title">{job.title}</h1>
            <div className="job-meta">
              <span>📍 {job.location}</span>
              <span>💼 {job.job_type}</span>
              <span>📝 {applications.length} Applications</span>
            </div>
            <Link to="/employer/dashboard" className="back-link">
              ← Back to Dashboard
            </Link>
          </div>
        )}

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
            Pending ({applications.filter((a) => a.status?.toLowerCase() === 'pending').length})
          </button>
          <button
            className={`filter-button ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({applications.filter((a) => a.status?.toLowerCase() === 'accepted').length})
          </button>
          <button
            className={`filter-button ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter((a) => a.status?.toLowerCase() === 'rejected').length})
          </button>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="applications-grid">
            {filteredApplications.map((application) => (
              <div key={application.id} className="applicant-card">
                <div className="applicant-header">
                  <div>
                    <h3 className="applicant-name">{application.applicant_name}</h3>
                    <p className="applicant-email">{application.applicant_email}</p>
                    {application.applicant_phone && (
                      <p className="applicant-phone">📱 {application.applicant_phone}</p>
                    )}
                  </div>
                  <span className={`status-badge ${getStatusClass(application.status)}`}>
                    {application.status || 'Pending'}
                  </span>
                </div>

                <div className="applicant-details">
                  {application.applicant_location && (
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span>{application.applicant_location}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Applied on:</span>
                    <span>{new Date(application.created_at).toLocaleDateString()}</span>
                  </div>
                  {application.applicant_skills && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Skills:</span>
                      <span>{application.applicant_skills}</span>
                    </div>
                  )}
                </div>

                {application.resume_url && (
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-link"
                  >
                    📄 View Resume
                  </a>
                )}

                <div className="action-buttons">
                  {application.status?.toLowerCase() !== 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(application.id, 'Accepted')}
                      className="accept-button"
                    >
                      Accept
                    </button>
                  )}
                  {application.status?.toLowerCase() !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(application.id, 'Rejected')}
                      className="reject-button"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {filter === 'all'
                ? 'No applications received yet.'
                : `No ${filter} applications found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplications;
