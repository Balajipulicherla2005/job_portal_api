import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './JobForm.css';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    qualifications: '',
    responsibilities: '',
    jobType: 'full-time',
    location: '',
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    skills: '',
    benefits: '',
    status: 'active',
    applicationDeadline: ''
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      const job = response.data.data;

      setFormData({
        title: job.title || '',
        description: job.description || '',
        qualifications: job.qualifications || '',
        responsibilities: job.responsibilities || '',
        jobType: job.jobType || 'full-time',
        location: job.location || '',
        salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '',
        experienceLevel: job.experienceLevel || '',
        skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
        benefits: job.benefits || '',
        status: job.status || 'active',
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Fetch job error:', error);
      toast.error('Failed to load job details');
      navigate('/employer/jobs');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const jobData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        applicationDeadline: formData.applicationDeadline || null
      };

      await api.put(`/jobs/${id}`, jobData);
      
      toast.success('Job updated successfully!');
      navigate('/employer/jobs');
    } catch (error) {
      console.error('Update job error:', error);
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="job-form-page">
        <div className="loading-container">Loading job details...</div>
      </div>
    );
  }

  return (
    <div className="job-form-page">
      <div className="job-form-container">
        <h1 className="page-title">Edit Job Posting</h1>
        
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="jobType">Job Type *</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salaryMin">Minimum Salary ($/year)</label>
                <input
                  type="number"
                  id="salaryMin"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="salaryMax">Maximum Salary ($/year)</label>
                <input
                  type="number"
                  id="salaryMax"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="applicationDeadline">Application Deadline</label>
              <input
                type="date"
                id="applicationDeadline"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Job Details</h2>

            <div className="form-group">
              <label htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="responsibilities">Key Responsibilities</label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows="5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="qualifications">Qualifications & Requirements</label>
              <textarea
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows="5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Required Skills (comma-separated)</label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                rows="3"
              />
              <small>Separate skills with commas</small>
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Benefits & Perks</label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/employer/jobs')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
