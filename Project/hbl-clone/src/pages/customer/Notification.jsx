import React, { useEffect, useState } from 'react';
import { CheckCircle, Bell, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [marking, setMarking] = useState({});
    const [deleting, setDeleting] = useState({});
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await dashboardService.getNotifications(1, 30);
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        setMarking((prev) => ({ ...prev, [id]: true }));
        try {
            await dashboardService.markNotificationAsRead(id);
            setNotifications((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Failed to mark notification as read. Please try again.');
        }
        setMarking((prev) => ({ ...prev, [id]: false }));
    };

    const handleDelete = async (id) => {
        setDeleting((prev) => ({ ...prev, [id]: true }));
        try {
            await dashboardService.deleteNotification(id);
            setNotifications((prev) => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
            setError('Failed to delete notification. Please try again.');
        }
        setDeleting((prev) => ({ ...prev, [id]: false }));
    };

    return (
        <div className="min-h-screen theme-container flex flex-col">
            {/* Header */}
            <div className="theme-card-elevated border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/customer/dashboard')}
                            className="p-2 rounded-lg theme-card hover:theme-card-hover transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 theme-text" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold theme-heading-1">Notifications</h1>
                            <p className="text-sm theme-text-secondary">View your recent alerts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin theme-accent mb-4" />
                        <span className="theme-text-secondary">Loading notifications...</span>
                    </div>
                ) : error ? (
                    <div className="theme-card rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={fetchNotifications} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="theme-card rounded-lg p-6 text-center">
                        <Bell className="w-10 h-10 mx-auto theme-text mb-4" />
                        <p className="theme-text-secondary">No notifications yet.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map((n) => (
                            <li key={n._id} className={`theme-card-elevated rounded-lg p-4 flex items-start gap-3 border-l-4 ${n.read ? 'border-gray-200' : 'border-blue-600'} transition-all`}>
                                <div className="flex-shrink-0 mt-1">
                                    {n.read ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Bell className="w-6 h-6 theme-accent" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${n.read ? 'theme-text-secondary' : 'theme-text'}`}>{n.title}</span>
                                        {!n.read && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">New</span>
                                        )}
                                    </div>
                                    <p className="theme-text-secondary text-sm mt-1 break-words">{n.message}</p>
                                    <div className="text-xs theme-text-muted mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="flex flex-col gap-2 items-end ml-2">
                                    {!n.read && (
                                        <button
                                            className="px-2 py-1 text-xs rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                                            onClick={() => handleMarkAsRead(n._id)}
                                            disabled={marking[n._id]}
                                        >
                                            {marking[n._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as read'}
                                        </button>
                                    )}
                                    <button
                                        className="px-2 py-1 text-xs rounded bg-red-50 hover:bg-red-100 text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
                                        onClick={() => handleDelete(n._id)}
                                        disabled={deleting[n._id]}
                                    >
                                        {deleting[n._id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}<span className="sr-only">Delete</span>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
