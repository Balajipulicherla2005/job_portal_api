import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './JobForm.css';

const CreateJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    applicationDeadline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert skills string to array
      const jobData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        applicationDeadline: formData.applicationDeadline || null
      };

      const response = await api.post('/jobs', jobData);
      
      toast.success('Job posted successfully!');
      navigate('/employer/jobs');
    } catch (error) {
      console.error('Create job error:', error);
      toast.error(error.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-form-page">
      <div className="job-form-container">
        <h1 className="page-title">Post a New Job</h1>
        
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
                placeholder="e.g., Senior Software Engineer"
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
                placeholder="e.g., San Francisco, CA or Remote"
              />
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
                  placeholder="e.g., 80000"
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
                  placeholder="e.g., 120000"
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
                placeholder="Describe the role, what the candidate will be doing, and why they should join your company"
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
                placeholder="List the main responsibilities and duties"
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
                placeholder="List required education, experience, and skills"
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
                placeholder="e.g., JavaScript, React, Node.js, SQL"
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
                placeholder="List benefits like health insurance, 401k, flexible hours, etc."
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
