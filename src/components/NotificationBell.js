import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../pages/Notifications.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      const data = response.data.data;
      setNotifications(data.notifications.slice(0, 5)); // Show only latest 5
      setUnreadCount(data.unreadCount);
    } catch (error) {
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setShowDropdown(false);
    
    // Navigate to related content
    if (notification.relatedType === 'application') {
      navigate(`/applications/${notification.relatedId}`);
    } else if (notification.relatedType === 'job') {
      navigate(`/jobs/${notification.relatedId}`);
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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <div 
        className="notification-bell-icon"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>

          <div className="notification-dropdown-list">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-dropdown-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                    <div style={{ fontSize: '1.5rem' }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        {notification.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>
                        {getTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notification-dropdown-footer">
            <Link to="/notifications" onClick={() => setShowDropdown(false)}>
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
