import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [userType, setUserType] = useState('jobseeker');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Job Seeker specific
    skills: '',
    experience: '',
    education: '',
    // Employer specific
    companyName: '',
    companyDescription: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const dashboardPath = user.userType === 'jobseeker' 
        ? '/dashboard/jobseeker' 
        : '/dashboard/employer';
      navigate(dashboardPath);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      userType
    };

    if (userType === 'jobseeker') {
      userData.skills = formData.skills;
      userData.experience = formData.experience;
      userData.education = formData.education;
    } else {
      userData.companyName = formData.companyName;
      userData.companyDescription = formData.companyDescription;
      userData.website = formData.website;
    }

    const result = await register(userData);
    
    if (result.success) {
      toast.success('Registration successful!');
      const dashboardPath = userType === 'jobseeker' 
        ? '/dashboard/jobseeker' 
        : '/dashboard/employer';
      navigate(dashboardPath);
    } else {
      toast.error(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card large">
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Join us and start your journey</p>
          
          {/* User Type Selection */}
          <div className="user-type-selection">
            <button
              type="button"
              className={`user-type-btn ${userType === 'jobseeker' ? 'active' : ''}`}
              onClick={() => setUserType('jobseeker')}
            >
              I'm a Job Seeker
            </button>
            <button
              type="button"
              className={`user-type-btn ${userType === 'employer' ? 'active' : ''}`}
              onClick={() => setUserType('employer')}
            >
              I'm an Employer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Common Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            {/* Job Seeker Specific Fields */}
            {userType === 'jobseeker' && (
              <>
                <div className="form-group">
                  <label htmlFor="skills">Skills</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    className="form-control"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="experience">Years of Experience</label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      className="form-control"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g., 3 years"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="education">Education</label>
                    <input
                      type="text"
                      id="education"
                      name="education"
                      className="form-control"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="e.g., Bachelor's in CS"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Employer Specific Fields */}
            {userType === 'employer' && (
              <>
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    className="form-control"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="Enter company name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="companyDescription">Company Description</label>
                  <textarea
                    id="companyDescription"
                    name="companyDescription"
                    className="form-control"
                    rows="3"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    placeholder="Tell us about your company"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Company Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    className="form-control"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
