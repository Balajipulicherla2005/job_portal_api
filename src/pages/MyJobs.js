import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './MyJobs.css';

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, closedJobs: 0 });

  useEffect(() => {
    fetchMyJobs();
    fetchStats();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const response = await api.get('/jobs/employer/my-jobs');
      setJobs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast.error('Failed to load jobs');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/jobs/employer/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchMyJobs();
      fetchStats();
    } catch (error) {
      console.error('Delete job error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/employer/jobs/edit/${jobId}`);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (!min) return `Up to $${max.toLocaleString()}`;
    if (!max) return `From $${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-jobs-page">
        <div className="loading-container">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="my-jobs-page">
      <div className="page-header">
        <h1>My Job Postings</h1>
        <button onClick={() => navigate('/employer/jobs/create')} className="btn-create">
          + Post New Job
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.totalJobs}</h3>
          <p>Total Jobs</p>
        </div>
        <div className="stat-card">
          <h3>{stats.activeJobs}</h3>
          <p>Active Jobs</p>
        </div>
        <div className="stat-card">
          <h3>{stats.closedJobs}</h3>
          <p>Closed Jobs</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <h2>No Job Postings Yet</h2>
          <p>Start by creating your first job posting</p>
          <button onClick={() => navigate('/employer/jobs/create')} className="btn-primary">
            Post Your First Job
          </button>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div>
                  <h2>{job.title}</h2>
                  <p className="job-meta">
                    {job.jobType} • {job.location} • Posted {formatDate(job.createdAt)}
                  </p>
                </div>
                <span className={`status-badge status-${job.status}`}>
                  {job.status}
                </span>
              </div>

              <div className="job-details">
                <p className="job-description">
                  {job.description.length > 200
                    ? `${job.description.substring(0, 200)}...`
                    : job.description}
                </p>

                <div className="job-info">
                  <div className="info-item">
                    <strong>Salary:</strong> {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                  {job.experienceLevel && (
                    <div className="info-item">
                      <strong>Experience:</strong> {job.experienceLevel}
                    </div>
                  )}
                  {job.skills && job.skills.length > 0 && (
                    <div className="info-item">
                      <strong>Skills:</strong> {job.skills.slice(0, 3).join(', ')}
                      {job.skills.length > 3 && ` +${job.skills.length - 3} more`}
                    </div>
                  )}
                </div>
              </div>

              <div className="job-actions">
                <button onClick={() => navigate(`/jobs/${job.id}`)} className="btn-view">
                  View Details
                </button>
                <button onClick={() => handleEdit(job.id)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDelete(job.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
