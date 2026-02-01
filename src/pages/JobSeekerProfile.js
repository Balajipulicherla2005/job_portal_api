import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

const JobSeekerProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    skills: [],
    experience: '',
    education: '',
    bio: '',
  });
  const [resume, setResume] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/jobseeker');
      const profile = response.data.data;
      
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        skills: profile.skills || [],
        experience: profile.experience || '',
        education: profile.education || '',
        bio: profile.bio || '',
      });
      setCurrentResume(profile.resumePath);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        // Profile doesn't exist yet
        setLoading(false);
      } else {
        toast.error('Failed to load profile');
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'skills') {
      // Convert comma-separated string to array
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(Boolean);
      setFormData({
        ...formData,
        [name]: skillsArray,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setResume(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/profile/jobseeker', formData);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resume) {
      toast.error('Please select a file first');
      return;
    }

    setUploadingResume(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', resume);

      await api.post('/profile/jobseeker/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Resume uploaded successfully!');
      setResume(null);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Job Seeker Profile</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2 className="section-title">Personal Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself and your career goals"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Professional Details</h2>

            <div className="form-group">
              <label htmlFor="skills">Skills (comma-separated)</label>
              <textarea
                id="skills"
                name="skills"
                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                onChange={handleChange}
                rows="3"
                placeholder="JavaScript, React, Node.js, Python, SQL"
              />
              <small>Separate skills with commas</small>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Work Experience</label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows="6"
                placeholder="Describe your work experience, including company names, roles, and dates"
              />
            </div>

            <div className="form-group">
              <label htmlFor="education">Education</label>
              <textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                rows="4"
                placeholder="Your educational background, degrees, and certifications"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Resume</h2>

            {currentResume && (
              <div className="current-resume">
                <p>✓ Resume uploaded</p>
                <a
                  href={`http://localhost:5002${currentResume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-link"
                >
                  View Current Resume
                </a>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="resume">Upload New Resume (PDF, DOC, DOCX - Max 5MB)</label>
              <div className="file-upload-section">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {resume && (
                  <div className="file-selected">
                    <p className="file-name">✓ Selected: {resume.name}</p>
                    <button
                      type="button"
                      onClick={handleResumeUpload}
                      className="upload-button"
                      disabled={uploadingResume}
                    >
                      {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobSeekerProfile;
