import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const GlobalBanner = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [visible, setVisible] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Fetch announcements on mount and route change (to keep fresh, or just mount)
        // Ideally just mount and maybe poll or socket. For now, on mount.
        const fetchAnnouncements = async () => {
            try {
                // Determine context (public vs admin vs owner) - for now just public 'all' endpoint
                // If logged in, we might want to fetch targeted ones. 
                // The public endpoint /api/announcements returns active 'all' target.
                // Authenticated users might fetch separate list.
                // For simplicity Phase 1: Just Global Broadcasts.
                const res = await axios.get('http://localhost:5001/api/announcements');
                setAnnouncements(res.data);
            } catch (error) {
                console.error('Error fetching banner', error);
            }
        };

        fetchAnnouncements();
    }, [location.pathname]); // Refetch on route change to ensure freshness? Or just once.

    if (announcements.length === 0 || !visible) return null;

    // Show top-most announcement
    const activeAnnouncement = announcements[0];

    // Check if dismissed in session
    const isDismissed = sessionStorage.getItem(`dismissed_announcement_${activeAnnouncement._id}`);
    if (isDismissed) return null;

    const handleDismiss = () => {
        setVisible(false);
        sessionStorage.setItem(`dismissed_announcement_${activeAnnouncement._id}`, 'true');
    };

    const getStyles = (type) => {
        switch (type) {
            case 'error': return 'bg-red-600 text-white';
            case 'warning': return 'bg-yellow-500 text-white';
            case 'success': return 'bg-green-600 text-white';
            default: return 'bg-indigo-600 text-white';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'error': return <AlertCircle size={18} />;
            case 'warning': return <AlertTriangle size={18} />;
            case 'success': return <CheckCircle size={18} />;
            default: return <Megaphone size={18} />;
        }
    };

    return (
        <div className={`${getStyles(activeAnnouncement.type)} px-4 py-3 shadow-lg relative z-50 animate-in slide-in-from-top duration-300`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="p-1 bg-white/20 rounded">
                        {getIcon(activeAnnouncement.type)}
                    </span>
                    <p className="font-medium text-sm md:text-base">
                        <span className="font-bold mr-2">{activeAnnouncement.title}:</span>
                        {activeAnnouncement.message}
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default GlobalBanner;
