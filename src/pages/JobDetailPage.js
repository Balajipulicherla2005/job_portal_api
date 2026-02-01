import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './JobDetails.css';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isJobSeeker, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    if (isAuthenticated && isJobSeeker) {
      checkApplicationStatus();
    }
  }, [id, isAuthenticated, isJobSeeker]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      console.log('Job details response:', response);
      setJob(response.data.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get(`/applications/check/${id}`);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.info('Please login as a job seeker to apply');
      navigate('/login');
      return;
    }

    if (!isJobSeeker) {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    if (hasApplied) {
      toast.info('You have already applied to this job');
      return;
    }

    setApplying(true);
    try {
      await api.post(`/applications`, { jobId: id });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading job details...</div>;
  }

  if (!job) {
    return <div className="error-container">Job not found</div>;
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        {/* Job Header */}
        <div className="job-detail-header">
          <div className="job-header-content">
            <h1 className="job-detail-title">{job.title}</h1>
            <p className="job-detail-company">{job.companyName}</p>
            <div className="job-meta">
              <span className="job-meta-item">📍 {job.location}</span>
              <span className="job-meta-item">💼 {job.jobType}</span>
              {job.salary_range && (
                <span className="job-meta-item">💰 {job.salary_range}</span>
              )}
            </div>
          </div>
          {isJobSeeker && (
            <button
              onClick={handleApply}
              className={`apply-button ${hasApplied ? 'applied' : ''}`}
              disabled={applying || hasApplied}
            >
              {hasApplied ? 'Already Applied' : applying ? 'Applying...' : 'Apply Now'}
            </button>
          )}
        </div>

        {/* Job Details */}
        <div className="job-detail-content">
          <section className="detail-section">
            <h2>Job Description</h2>
            <p className="detail-text">{job.description}</p>
          </section>

          {job.qualifications && (
            <section className="detail-section">
              <h2>Qualifications</h2>
              <p className="detail-text">{job.qualifications}</p>
            </section>
          )}

          {job.responsibilities && (
            <section className="detail-section">
              <h2>Responsibilities</h2>
              <p className="detail-text">{job.responsibilities}</p>
            </section>
          )}

          {job.company_description && (
            <section className="detail-section">
              <h2>About the Company</h2>
              <p className="detail-text">{job.company_description}</p>
            </section>
          )}

          <section className="detail-section">
            <h2>Additional Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Posted on:</strong>
                <span>{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              {job.contact_email && (
                <div className="info-item">
                  <strong>Contact:</strong>
                  <span>{job.contact_email}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Action Section */}
        {isJobSeeker && (
          <div className="job-action-section">
            <button
              onClick={handleApply}
              className={`apply-button-large ${hasApplied ? 'applied' : ''}`}
              disabled={applying || hasApplied}
            >
              {hasApplied ? 'Already Applied' : applying ? 'Applying...' : 'Apply for this Job'}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="login-prompt">
            <p>Want to apply for this job?</p>
            <button onClick={() => navigate('/login')} className="login-button">
              Login as Job Seeker
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
