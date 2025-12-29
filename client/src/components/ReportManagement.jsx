import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Shield } from 'lucide-react'; // Ensure imports are correct

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await axios.get('/api/reports?status=Pending', config);
            setReports(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDismissReport = async (reportId) => {
        setActionLoading(reportId);
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put(`/api/reports/${reportId}`, {
                status: 'Resolved',
                resolutionNote: 'Dismissed by admin'
            }, config);

            setReports(prev => prev.filter(r => r._id !== reportId));
        } catch (error) {
            console.error(error);
            alert('Failed to dismiss report');
        }
        setActionLoading(null);
    };

    const handleDeleteContent = async (report) => {
        if (!window.confirm('Are you sure you want to delete this content? This cannot be undone.')) return;
        setActionLoading(report._id);

        const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        };

        try {
            if (report.type === 'API') {
                if (report.api) {
                    await axios.delete(`/api/apis/${report.api._id}`, config);
                }
            } else if (report.type === 'Review') {
                if (report.review) {
                    const apiId = report.review.api;
                    await axios.delete(`/api/apis/${apiId}/reviews/${report.review._id}`, config);
                }
            }

            // Mark report as resolved
            await axios.put(`/api/reports/${report._id}`, {
                status: 'Resolved',
                resolutionNote: 'Content Deleted'
            }, config);

            setReports(prev => prev.filter(r => r._id !== report._id));
            alert('Content deleted and report resolved.');

        } catch (error) {
            console.error(error);
            alert('Failed to delete content: ' + (error.response?.data?.message || error.message));
        }
        setActionLoading(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Report Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">Investigate and resolve user reports.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400 animate-pulse">Loading reports...</div>
                    ) : reports.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {reports.map((report) => (
                                <li key={report._id} className="group hover:bg-gray-50/80 transition-colors duration-200 p-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${report.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {report.type} Report
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        • {new Date(report.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                    {report.reason}
                                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">by {report.reporter?.username}</span>
                                                </h4>

                                                <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 py-1">
                                                    "{report.description}"
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDismissReport(report._id)}
                                                    disabled={actionLoading === report._id}
                                                    className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                >
                                                    Dismiss
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContent(report)}
                                                    disabled={actionLoading === report._id}
                                                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
                                                >
                                                    Delete Content
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content Preview Box */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-sm">
                                            <p className="uppercase text-slate-400 font-bold text-[10px] tracking-widest mb-2">Flagged Content</p>
                                            {report.type === 'API' && report.api ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                        {report.api.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{report.api.name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">ID: {report.api._id}</div>
                                                    </div>
                                                </div>
                                            ) : report.type === 'Review' && report.review ? (
                                                <div className="relative pl-4">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-200 rounded-full"></div>
                                                    <div className="font-medium text-gray-900">"{report.review.comment}"</div>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                        <span>Rating: {report.review.rating}/5</span>
                                                        <span>•</span>
                                                        <span>ID: {report.review._id}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-500 italic bg-red-50 px-3 py-2 rounded-lg inline-block">
                                                    <AlertTriangle size={14} />
                                                    Content no longer exists (previously deleted)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Shield size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Safe & Sound</h3>
                            <p className="text-gray-500 mt-1">Zero active reports to investigate.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportManagement;
