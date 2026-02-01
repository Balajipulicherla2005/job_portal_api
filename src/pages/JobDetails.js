import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI, applicationAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobAPI.getJobById(id);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to fetch job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.info('Please login to apply');
      navigate('/login');
      return;
    }

    if (user.userType !== 'jobseeker') {
      toast.error('Only job seekers can apply');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.apply(id, { coverLetter });
      toast.success('Application submitted successfully!');
      setCoverLetter('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loading />;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="page-container">
      <div className="job-details-container">
        <div className="job-details-main">
          <div className="card">
            <div className="job-details-header">
              <div>
                <h1 className="job-details-title">{job.title}</h1>
                <div className="job-details-meta">
                  <span className="company-name">{job.companyName}</span>
                  <span className="job-type-badge">{job.jobType}</span>
                </div>
              </div>
            </div>

            <div className="job-details-info">
              <div className="info-item">
                <strong>📍 Location:</strong> {job.location}
              </div>
              <div className="info-item">
                <strong>💰 Salary:</strong> ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
              </div>
              <div className="info-item">
                <strong>📅 Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="divider"></div>

            <div className="job-section">
              <h2>Job Description</h2>
              <p className="section-content">{job.description}</p>
            </div>

            {job.qualifications && (
              <div className="job-section">
                <h2>Qualifications</h2>
                <p className="section-content">{job.qualifications}</p>
              </div>
            )}

            {job.responsibilities && (
              <div className="job-section">
                <h2>Responsibilities</h2>
                <p className="section-content">{job.responsibilities}</p>
              </div>
            )}
          </div>

          {user && user.userType === 'jobseeker' && (
            <div className="card">
              <h2>Apply for this Position</h2>
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                <textarea
                  id="coverLetter"
                  className="form-control"
                  rows="6"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>
              <button 
                onClick={handleApply} 
                className="btn btn-primary btn-block"
                disabled={applying}
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
