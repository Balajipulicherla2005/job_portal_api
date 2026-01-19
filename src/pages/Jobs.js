import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/api';
import { toast } from 'react-toastify';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    jobType: '',
    experienceLevel: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  const fetchJobs = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = {
        ...currentFilters,
        page: currentPage,
        limit: 10,
      };

      // Remove empty filter values
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await jobService.getAllJobs(params);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Error fetching jobs');
      console.error('Fetch jobs error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJobs(filters, pagination.page);
  }, []);

  // Handle page changes only
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchJobs(filters, pagination.page);
  }, [pagination.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));

    // Debounce for text inputs
    if (name === 'keyword' || name === 'location') {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer - wait 500ms after user stops typing
      debounceTimerRef.current = setTimeout(() => {
        const newFilters = {
          ...filters,
          [name]: value,
        };
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchJobs(newFilters, 1);
      }, 500);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs(filters, 1);
  };

  const handleReset = () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    const clearedFilters = {
      keyword: '',
      location: '',
      jobType: '',
      experienceLevel: '',
    };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs(clearedFilters, 1);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const formatSalary = (min, max, period) => {
    if (!min && !max) return 'Salary not specified';
    const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);
    if (min && max) {
      return `$${formatNum(min)} - $${formatNum(max)} ${period}`;
    } else if (min) {
      return `$${formatNum(min)}+ ${period}`;
    } else {
      return `Up to $${formatNum(max)} ${period}`;
    }
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <h1 className="page-title">Browse Jobs</h1>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-inputs">
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Job title, keywords, or company"
                className="search-input"
              />
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location"
                className="search-input"
              />
            </div>

            <div className="filter-row">
              <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
                <option value="">All Job Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>

              <select
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleFilterChange}
              >
                <option value="">All Experience Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>

              <button type="submit" className="btn btn-primary">
                Search
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                Reset
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="results-info">
              <p>
                Found {pagination.total} job{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            {jobs.length === 0 ? (
              <div className="no-results">
                <p>No jobs found matching your criteria.</p>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3 className="job-title">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <span className="job-type">{job.jobType}</span>
                    </div>

                    <div className="job-company">
                      {job.employer?.employerProfile?.companyName || 'Company Name'}
                    </div>

                    <div className="job-details">
                      <span className="job-location">📍 {job.location}</span>
                      <span className="job-salary">
                        💰 {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
                      </span>
                      {job.experienceLevel && (
                        <span className="job-experience">
                          👤 {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                        </span>
                      )}
                    </div>

                    <p className="job-description">
                      {job.description.substring(0, 200)}
                      {job.description.length > 200 ? '...' : ''}
                    </p>

                    <div className="job-footer">
                      <span className="job-date">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;
