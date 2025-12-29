import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Trash2, Plus, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const AnnouncementManager = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        expiresInDays: 7
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/announcements/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(res.data);
        } catch (error) {
            console.error('Error fetching announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresInDays));

            await axios.post('http://localhost:5001/api/announcements/admin', {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                target: formData.target,
                expiresAt
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormData({
                title: '',
                message: '',
                type: 'info',
                target: 'all',
                expiresInDays: 7
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement', error);
            alert('Failed to create announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/announcements/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (error) {
            console.error('Error deleting announcement', error);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'error': return <AlertCircle className="text-red-500" size={16} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={16} />;
            case 'success': return <CheckCircle className="text-green-500" size={16} />;
            default: return <Info className="text-blue-500" size={16} />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Broadcasting System
                </h2>
                <p className="text-sm text-gray-500 mt-1">Send system-wide announcements to users.</p>
            </div>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Megaphone size={16} className="text-indigo-600" /> New Broadcast
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm"
                                placeholder="Brief title..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm"
                            >
                                <option value="info">Info (Blue)</option>
                                <option value="success">Success (Green)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="error">Critical (Red)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Message</label>
                        <textarea
                            required
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm h-24"
                            placeholder="Detailed message..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Target Audience</label>
                            <select
                                value={formData.target}
                                onChange={e => setFormData({ ...formData, target: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm"
                            >
                                <option value="all">Everywhere (Global Banner)</option>
                                <option value="owners">API Owners Only</option>
                                <option value="admins">Admins Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (Days)</label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={formData.expiresInDays}
                                onChange={e => setFormData({ ...formData, expiresInDays: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-auto text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Plus size={16} /> Publish Broadcast
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Active Broadcasts</h3>
                {loading ? (
                    <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                        No active announcements.
                    </div>
                ) : (
                    announcements.map(ann => (
                        <div key={ann._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group">
                            <div className="flex gap-4">
                                <div className={`mt-1 p-2 rounded-full bg-gray-50`}>
                                    {getTypeIcon(ann.type)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        {ann.title}
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                            {ann.target}
                                        </span>
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">{ann.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Expires: {new Date(ann.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(ann._id)}
                                className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AnnouncementManager;
