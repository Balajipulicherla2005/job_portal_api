import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isJobSeeker, isEmployer, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          JobPortal
        </Link>

        <button className="navbar-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/jobs" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Browse Jobs
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              {isJobSeeker && (
                <>
                  <li className="navbar-item">
                    <Link
                      to="/job-seeker/dashboard"
                      className="navbar-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link
                      to="/job-seeker/applications"
                      className="navbar-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link
                      to="/job-seeker/profile"
                      className="navbar-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                </>
              )}

              {isEmployer && (
                <>
                  <li className="navbar-item">
                    <Link
                      to="/employer/dashboard"
                      className="navbar-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link
                      to="/employer/jobs/create"
                      className="navbar-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link
                      to="/employer/profile"
                      className="navbar-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                </>
              )}

              <li className="navbar-item">
                <NotificationBell />
              </li>

              <li className="navbar-item">
                <span className="navbar-user">Hello, {user?.name || user?.email}</span>
              </li>
              <li className="navbar-item">
                <button className="navbar-button logout" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <button className="navbar-button">Sign Up</button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
