import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Notifications.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'application_status_change':
        return '📋';
      case 'new_application':
        return '📨';
      case 'job_posted':
        return '💼';
      case 'profile_view':
        return '👀';
      default:
        return '🔔';
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.relatedType === 'application') {
      return `/applications/${notification.relatedId}`;
    } else if (notification.relatedType === 'job') {
      return `/jobs/${notification.relatedId}`;
    }
    return '#';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="btn-secondary"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications to display</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <div className="notification-footer">
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {notification.relatedId && (
                    <Link 
                      to={getNotificationLink(notification)}
                      className="view-link"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="action-btn"
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="action-btn delete"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
