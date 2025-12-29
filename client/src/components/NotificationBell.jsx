import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const res = await axios.get('/api/notifications', config);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, [user]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, link) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put(`/api/notifications/${id}/read`, {}, config);

            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (link) {
                navigate(link);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put('/api/notifications/read-all', {}, config);

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-all focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification._id}
                                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => handleMarkAsRead(notification._id, notification.link)}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 mb-0.5">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <div className="bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                                    <Bell className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
