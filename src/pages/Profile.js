import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, isJobSeeker, isEmployer } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Job Seeker fields
    skills: '',
    experience: '',
    education: '',
    location: '',
    // Employer fields
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        skills: user.skills?.join(', ') || '',
        experience: user.experience || '',
        education: user.education || '',
        location: user.location || '',
        companyName: user.companyName || '',
        companyDescription: user.companyDescription || '',
        companyWebsite: user.companyWebsite || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('email', formData.email);
      updateData.append('phone', formData.phone);

      if (isJobSeeker) {
        const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
        updateData.append('skills', JSON.stringify(skillsArray));
        updateData.append('experience', formData.experience);
        updateData.append('education', formData.education);
        updateData.append('location', formData.location);
        if (resume) {
          updateData.append('resume', resume);
        }
      } else if (isEmployer) {
        updateData.append('companyName', formData.companyName);
        updateData.append('companyDescription', formData.companyDescription);
        updateData.append('companyWebsite', formData.companyWebsite);
      }

      const response = await authAPI.updateProfile(updateData);
      updateUser(response.data.data);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {isJobSeeker && (
              <>
                <div className="form-section">
                  <h2>Professional Information</h2>
                  <div className="form-group">
                    <label>Skills (comma-separated)</label>
                    <input
                      type="text"
                      name="skills"
                      className="form-control"
                      placeholder="e.g., JavaScript, React, Node.js"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Experience</label>
                    <textarea
                      name="experience"
                      className="form-control"
                      rows="4"
                      placeholder="Describe your work experience"
                      value={formData.experience}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Education</label>
                    <textarea
                      name="education"
                      className="form-control"
                      rows="3"
                      placeholder="Your educational background"
                      value={formData.education}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      placeholder="Your current location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2>Resume</h2>
                  <div className="form-group">
                    <label>Upload Resume</label>
                    {user.resume && (
                      <div className="current-resume">
                        <p>Current resume: {user.resume.split('/').pop()}</p>
                      </div>
                    )}
                    <input
                      type="file"
                      name="resume"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <small>Accepted formats: PDF, DOC, DOCX (Max 5MB)</small>
                  </div>
                </div>
              </>
            )}

            {isEmployer && (
              <div className="form-section">
                <h2>Company Information</h2>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-control"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Company Description</label>
                  <textarea
                    name="companyDescription"
                    className="form-control"
                    rows="4"
                    placeholder="Tell us about your company"
                    value={formData.companyDescription}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Company Website</label>
                  <input
                    type="url"
                    name="companyWebsite"
                    className="form-control"
                    placeholder="https://example.com"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
