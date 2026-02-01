const { Notification } = require('../models');

// Create notification helper
const createNotification = async ({ userId, title, message, type, relatedId, relatedType }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedType,
      isRead: false
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Create notification for application status change
const notifyApplicationStatusChange = async (application, oldStatus, newStatus) => {
  const statusMessages = {
    'pending': 'Your application is pending review',
    'reviewing': 'Your application is under review',
    'shortlisted': 'Congratulations! You have been shortlisted',
    'rejected': 'Unfortunately, your application was not selected',
    'accepted': 'Congratulations! Your application has been accepted'
  };

  const title = `Application Status Updated`;
  const message = `Your application for "${application.job.title}" has been updated from "${oldStatus}" to "${newStatus}". ${statusMessages[newStatus] || ''}`;

  return await createNotification({
    userId: application.jobSeekerId,
    title,
    message,
    type: 'application_status',
    relatedId: application.id,
    relatedType: 'application'
  });
};

// Create notification for new application (employer)
const notifyNewApplication = async (application, employerId) => {
  try {
    const title = 'New Application Received';
    // Safely access nested properties
    const applicantName = application?.jobSeeker?.jobSeekerProfile?.fullName || 
                          application?.jobSeeker?.email || 
                          'A candidate';
    const jobTitle = application?.job?.title || 'your job posting';
    const message = `${applicantName} has applied for "${jobTitle}"`;

    return await createNotification({
      userId: employerId,
      title,
      message,
      type: 'new_application',
      relatedId: application.id,
      relatedType: 'application'
    });
  } catch (error) {
    console.error('Error in notifyNewApplication:', error);
    return null;
  }
};

module.exports = {
  createNotification,
  notifyApplicationStatusChange,
  notifyNewApplication
};
