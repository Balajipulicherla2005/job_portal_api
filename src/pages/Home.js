import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      if (user.userType === 'jobseeker') {
        navigate('/jobs');
      } else {
        navigate('/create-job');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Dream Job Today</h1>
          <p className="hero-subtitle">
            Connect with top employers and discover opportunities that match your skills and aspirations
          </p>
          <div className="hero-buttons">
            <button onClick={handleGetStarted} className="btn btn-primary btn-large">
              {user ? (user.userType === 'jobseeker' ? 'Browse Jobs' : 'Post a Job') : 'Get Started'}
            </button>
            <Link to="/jobs" className="btn btn-secondary btn-large">
              Explore Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Job Search</h3>
              <p>Search and filter jobs by location, type, salary, and keywords to find your perfect match</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Professional Profiles</h3>
              <p>Create comprehensive profiles with resume uploads and detailed information</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Applications</h3>
              <p>Apply to multiple jobs with just a few clicks using your saved profile</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your applications and get updates on their status in real-time</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>For Employers</h3>
              <p>Post jobs, manage applications, and find the perfect candidates efficiently</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Your data is protected with industry-standard security measures</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">Active Jobs</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">50,000+</h3>
              <p className="stat-label">Registered Users</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">5,000+</h3>
              <p className="stat-label">Companies</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">95%</h3>
              <p className="stat-label">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of job seekers and employers on our platform</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
