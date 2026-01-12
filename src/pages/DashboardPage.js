import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, jobAPI, applicationAPI } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (user.role === 'jobseeker') {
        const [statsRes, applicationsRes] = await Promise.all([
          dashboardAPI.getJobSeekerStats(),
          applicationAPI.getMyApplications({ limit: 5 }),
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (applicationsRes.success) setRecentItems(applicationsRes.data.applications);
      } else if (user.role === 'employer') {
        const [statsRes, jobsRes] = await Promise.all([
          dashboardAPI.getEmployerStats(),
          jobAPI.getMyJobs({ limit: 5 }),
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (jobsRes.success) setRecentItems(jobsRes.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>
            Welcome back, {user.firstName}!
          </h1>
          <p className="dashboard-subtitle">
            {user.role === 'jobseeker' 
              ? 'Track your job applications and find new opportunities'
              : 'Manage your job postings and review applications'}
          </p>
        </div>

        {user.role === 'jobseeker' ? (
          <JobSeekerDashboard stats={stats} applications={recentItems} />
        ) : (
          <EmployerDashboard stats={stats} jobs={recentItems} />
        )}
      </div>
    </div>
  );
};

const JobSeekerDashboard = ({ stats, applications }) => {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalApplications || 0}</h3>
          <p>Total Applications</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.pendingApplications || 0}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.shortlistedApplications || 0}</h3>
          <p>Shortlisted</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.rejectedApplications || 0}</h3>
          <p>Rejected</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Applications</h2>
          <Link to="/applications" className="btn btn-secondary">
            View All
          </Link>
        </div>

        {applications && applications.length > 0 ? (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <h3>{application.job?.title}</h3>
                  <span className={`status-badge status-${application.status}`}>
                    {application.status}
                  </span>
                </div>
                <p className="company-name">
                  {application.job?.employer?.companyName}
                </p>
                <p className="application-date">
                  Applied on {new Date(application.appliedAt).toLocaleDateString()}
                </p>
                <Link to={`/jobs/${application.job._id}`} className="btn btn-small btn-secondary">
                  View Job
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/jobs" className="action-card">
            <h3>Browse Jobs</h3>
            <p>Find your next opportunity</p>
          </Link>
          <Link to="/profile" className="action-card">
            <h3>Update Profile</h3>
            <p>Keep your information current</p>
          </Link>
        </div>
      </div>
    </>
  );
};

const EmployerDashboard = ({ stats, jobs }) => {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalJobs || 0}</h3>
          <p>Total Jobs</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.activeJobs || 0}</h3>
          <p>Active Jobs</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalApplications || 0}</h3>
          <p>Total Applications</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.pendingApplications || 0}</h3>
          <p>Pending Review</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Job Postings</h2>
          <Link to="/jobs/create" className="btn btn-primary">
            Post New Job
          </Link>
        </div>

        {jobs && jobs.length > 0 ? (
          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job._id} className="job-card-horizontal">
                <div className="job-info">
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <span className={`status-badge status-${job.status}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="job-meta">
                    {job.location.city}, {job.location.country} • {job.jobType}
                  </p>
                  <p className="job-stats">
                    {job.applicationCount} applications • {job.views} views
                  </p>
                </div>
                <div className="job-actions">
                  <Link to={`/jobs/${job._id}`} className="btn btn-small btn-secondary">
                    View
                  </Link>
                  <Link to={`/jobs/${job._id}/edit`} className="btn btn-small btn-secondary">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/jobs/create" className="btn btn-primary">
              Post Your First Job
            </Link>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/jobs/create" className="action-card">
            <h3>Post a Job</h3>
            <p>Find the perfect candidate</p>
          </Link>
          <Link to="/profile" className="action-card">
            <h3>Company Profile</h3>
            <p>Update your company information</p>
          </Link>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
