import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI } from '../services/api';
import Loading from '../components/common/Loading';
import './Jobs.css';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    location: '',
    salaryMin: '',
    salaryMax: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAllJobs(filters);
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchJobs();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      jobType: '',
      location: '',
      salaryMin: '',
      salaryMax: ''
    });
    setLoading(true);
    fetchJobs();
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Browse Jobs</h1>
        <p className="page-subtitle">Find your next opportunity</p>
      </div>

      {/* Filters */}
      <div className="filters-section card">
        <form onSubmit={handleSearch}>
          <div className="filters-grid">
            <div className="form-group">
              <input
                type="text"
                name="search"
                className="form-control"
                placeholder="Search by keyword..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <select
                name="jobType"
                className="form-control"
                value={filters.jobType}
                onChange={handleFilterChange}
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="Location"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                name="salaryMin"
                className="form-control"
                placeholder="Min Salary"
                value={filters.salaryMin}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                name="salaryMax"
                className="form-control"
                placeholder="Max Salary"
                value={filters.salaryMax}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-buttons">
              <button type="submit" className="btn btn-primary">
                Search
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Job List */}
      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <div className="no-results">
            <p>No jobs found matching your criteria.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                <span className="job-type">{job.jobType}</span>
              </div>
              <div className="job-company">{job.companyName}</div>
              <div className="job-details">
                <span>📍 {job.location}</span>
                <span>💰 ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
              </div>
              <p className="job-description">
                {job.description?.substring(0, 150)}...
              </p>
              <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobList;
