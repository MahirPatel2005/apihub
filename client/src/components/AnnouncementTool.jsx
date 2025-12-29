import React, { useState } from 'react';
import axios from 'axios';
import { Megaphone, Send, Bell, Layout } from 'lucide-react';

const AnnouncementTool = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [bannerText, setBannerText] = useState('');
    const [loading, setLoading] = useState(false);
    const [bannerLoading, setBannerLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to send this to ALL users?')) return;

        setLoading(true);
        setStatus(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5001/api/notifications/broadcast', {
                title,
                message,
                type: 'info'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', text: `Success! ${res.data.message}` });
            setTitle('');
            setMessage('');
        } catch (error) {
            setStatus({ type: 'error', text: 'Failed to send broadcast.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBanner = async (e) => {
        e.preventDefault();
        setBannerLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5001/api/settings', {
                key: 'ANNOUNCEMENT_BANNER',
                value: bannerText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', text: 'Global banner updated!' });
        } catch (error) {
            setStatus({ type: 'error', text: 'Failed to update banner.' });
        } finally {
            setBannerLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Broadcasting
                </h2>
                <p className="text-sm text-gray-500 mt-1">Communicate with all users via notifications or site-wide banners.</p>
            </div>

            {status && (
                <div className={`p-4 rounded-xl border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {status.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Push Notification Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">System Notification</h3>
                            <p className="text-sm text-gray-500">Send an in-app alert to every registered user.</p>
                        </div>
                    </div>

                    <form onSubmit={handleBroadcast} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Important Update"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="4"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="We are undergoing maintenance..."
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-3 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Sending...' : <><Send size={16} /> Send Broadcast</>}
                        </button>
                    </form>
                </div>

                {/* Global Banner Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Global Banner</h3>
                            <p className="text-sm text-gray-500">Display a persistent message at the top of the site.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateBanner} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
                            <textarea
                                value={bannerText}
                                onChange={(e) => setBannerText(e.target.value)}
                                rows="4"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Leaves blank to disable..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2">Clear text to remove the banner.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={bannerLoading}
                            className="w-full flex items-center justify-center gap-2 text-white bg-purple-600 hover:bg-purple-700 font-medium rounded-lg text-sm px-5 py-3 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                        >
                            {bannerLoading ? 'Updating...' : <><Megaphone size={16} /> Update Banner</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementTool;
