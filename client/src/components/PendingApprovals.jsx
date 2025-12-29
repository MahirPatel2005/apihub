import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Shield } from 'lucide-react';

const PendingApprovals = () => {
    const [pendingApis, setPendingApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPendingApis = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await axios.get('/api/admin/pending', config);
            setPendingApis(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingApis();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        setActionLoading(id);
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put(`/api/admin/apis/${id}/status`, { status }, config);
            setPendingApis(prev => prev.filter(api => api._id !== id));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
        setActionLoading(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Pending Approvals
                </h2>
                <p className="text-sm text-gray-500 mt-1">Review and action new API submissions.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400 animate-pulse">Loading submissions...</div>
                    ) : pendingApis.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {pendingApis.map((api) => (
                                <li key={api._id} className="group hover:bg-gray-50/80 transition-colors duration-200 p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                    {api.name}
                                                </h3>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                    {api.category}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Submitted {new Date(api.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                                {api.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs">
                                                <div className="flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                    <Shield size={12} className="mr-1.5 text-gray-400" />
                                                    {api.authType || 'None'}
                                                </div>
                                                <div className="flex items-center text-gray-500">
                                                    <span className="font-medium mr-1 text-gray-700">Owner:</span>
                                                    {api.owner?.username}
                                                </div>
                                                <div className="font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 truncate max-w-xs">
                                                    {api.baseUrl}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-3 shrink-0">
                                            <button
                                                onClick={() => handleStatusUpdate(api._id, 'Active')}
                                                disabled={actionLoading === api._id}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                                            >
                                                {actionLoading === api._id ? 'Processing...' : (
                                                    <><Check size={16} className="mr-2" /> Approve API</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(api._id, 'Rejected')}
                                                disabled={actionLoading === api._id}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 disabled:opacity-50"
                                            >
                                                {actionLoading === api._id ? '...' : (
                                                    <><X size={16} className="mr-2" /> Reject</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Check size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                            <p className="text-gray-500 mt-1">No pending APIs waiting for review.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingApprovals;
