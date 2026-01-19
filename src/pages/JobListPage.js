import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Jobs.css';

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    location: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  const isInitialMount = useRef(true);
  // Store current filters in ref to access in debounced callback
  const filtersRef = useRef(filters);
  
  // Update ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch jobs function
  const fetchJobs = useCallback(async (currentFilters, currentPage) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pagination.limit,
        ...currentFilters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await api.get('/jobs', { params });
      setJobs(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchJobs(filters, pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchJobs(filtersRef.current, pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // Debounced filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer - wait 500ms after user stops typing
    debounceTimerRef.current = setTimeout(() => {
      const newFilters = {
        ...filtersRef.current,
        [name]: value
      };
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchJobs(newFilters, 1);
    }, 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs(filtersRef.current, 1);
  };

  const clearFilters = () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    const clearedFilters = {
      search: '',
      jobType: '',
      location: '',
      experienceLevel: '',
      minSalary: '',
      maxSalary: ''
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

  const formatSalary = (job) => {
    if (!job.salaryMin && !job.salaryMax) return 'Not specified';
    
    const format = (num) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);

    if (job.salaryMin && job.salaryMax) {
      return `${format(job.salaryMin)} - ${format(job.salaryMax)} / ${job.salaryPeriod}`;
    }
    return job.salaryMin ? `${format(job.salaryMin)}+ / ${job.salaryPeriod}` : `Up to ${format(job.salaryMax)} / ${job.salaryPeriod}`;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="jobs-page">
        <div className="loading-container">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="jobs-container">
        <div className="jobs-header">
          <h1>Find Your Dream Job</h1>
          <p>Explore thousands of job opportunities</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="filters-form">
            <div className="filter-row">
              <input
                type="text"
                name="search"
                placeholder="Search jobs by title or description"
                value={filters.search}
                onChange={handleFilterChange}
                className="search-input"
              />
              <button type="submit" className="search-button">Search</button>
            </div>

            <div className="filter-row">
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={filters.location}
                onChange={handleFilterChange}
                className="filter-input"
              />

              <select
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Experience Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>

              <input
                type="number"
                name="minSalary"
                placeholder="Min Salary"
                value={filters.minSalary}
                onChange={handleFilterChange}
                className="filter-input"
                min="0"
              />

              <input
                type="number"
                name="maxSalary"
                placeholder="Max Salary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                className="filter-input"
                min="0"
              />

              <button type="button" onClick={clearFilters} className="clear-button">
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="results-info">
          <p>{pagination.total} jobs found</p>
        </div>

        {/* Job List */}
        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="no-jobs">
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            jobs.map(job => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <span className={`job-type ${job.jobType}`}>{job.jobType}</span>
                </div>

                <div className="job-company">
                  <span className="company-name">
                    {job.employer?.employerProfile?.companyName || 'Company Name'}
                  </span>
                  <span className="job-location">📍 {job.location}</span>
                </div>

                <p className="job-description">
                  {job.description.length > 200
                    ? `${job.description.substring(0, 200)}...`
                    : job.description}
                </p>

                <div className="job-details">
                  {job.experienceLevel && (
                    <span className="detail-tag">
                      {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                    </span>
                  )}
                  <span className="detail-tag">💰 {formatSalary(job)}</span>
                  {job.skills && job.skills.length > 0 && (
                    <span className="detail-tag">
                      {job.skills.length} skill{job.skills.length > 1 ? 's' : ''} required
                    </span>
                  )}
                </div>

                <div className="job-footer">
                  <span className="job-posted">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <button className="view-details-btn">View Details →</button>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="page-button"
            >
              Previous
            </button>

            <span className="page-info">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="page-button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListPage;
