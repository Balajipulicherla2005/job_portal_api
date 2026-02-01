import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple redirects
let isRedirecting = false;

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: 'Network error. Please check your connection.'
          }
        }
      });
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized
    if (status === 401) {
      // Only redirect if not already redirecting and not on auth pages
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      if (!isRedirecting && !isAuthPage) {
        // Check if the error is due to token issues (not rate limiting)
        const isTokenError = data?.message?.toLowerCase().includes('token') ||
                            data?.message?.toLowerCase().includes('authorized') ||
                            data?.message?.toLowerCase().includes('not found');
        
        if (isTokenError) {
          isRedirecting = true;
          localStorage.removeItem('token');
          
          // Use setTimeout to prevent immediate redirect
          setTimeout(() => {
            window.location.href = '/login';
            isRedirecting = false;
          }, 100);
        }
      }
    }

    // Handle 429 Rate Limit
    if (status === 429) {
      console.warn('Rate limit exceeded');
      return Promise.reject({
        response: {
          status: 429,
          data: {
            success: false,
            message: 'Too many requests. Please wait a moment and try again.'
          }
        }
      });
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('Access forbidden:', data?.message);
    }

    // Handle 500 Server Error
    if (status >= 500) {
      console.error('Server error:', data?.message);
      return Promise.reject({
        response: {
          status,
          data: {
            success: false,
            message: 'Server error. Please try again later.'
          }
        }
      });
    }

    return Promise.reject(error);
  }
);

// Job service helper
export const jobService = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  applyToJob: (id, data) => api.post(`/jobs/${id}/apply`, data),
};

// Application service helper
export const applicationService = {
  getMyApplications: () => api.get('/applications/my-applications'),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

// Profile service helper
export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Notification service helper
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api;
