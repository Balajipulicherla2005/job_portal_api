import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isJobSeeker, isEmployer } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Job Portal
          </Link>

          <div className="navbar-menu">
            <Link to="/jobs" className="nav-link">
              Browse Jobs
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                {isJobSeeker && (
                  <>
                    <Link to="/applications" className="nav-link">
                      My Applications
                    </Link>
                    <Link to="/profile/job-seeker" className="nav-link">
                      Profile
                    </Link>
                  </>
                )}
                {isEmployer && (
                  <>
                    <Link to="/my-jobs" className="nav-link">
                      My Jobs
                    </Link>
                    <Link to="/create-job" className="nav-link">
                      Post Job
                    </Link>
                    <Link to="/profile/employer" className="nav-link">
                      Profile
                    </Link>
                  </>
                )}
                <button onClick={logout} className="nav-btn logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn">
                  Login
                </Link>
                <Link to="/register" className="nav-btn primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
