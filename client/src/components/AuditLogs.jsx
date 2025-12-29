import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Shield, AlertTriangle, CheckCircle, Trash2, Clock } from 'lucide-react';

const AuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ admin: '', action: '', target: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page, filter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 20,
                ...filter
            });
            // Remove empty filters
            if (!filter.admin) queryParams.delete('admin');
            if (!filter.action) queryParams.delete('action');
            if (!filter.target) queryParams.delete('target');

            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5001/api/admin/logs?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLogs(res.data.logs);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
        setPage(1); // Reset to page 1 on filter change
    };

    const getActionIcon = (action) => {
        if (action.includes('BAN') || action.includes('DELETE') || action.includes('REJECT')) return <Trash2 size={16} className="text-red-500" />;
        if (action.includes('APPROVE') || action.includes('VERIFY') || action.includes('UNBAN')) return <CheckCircle size={16} className="text-green-500" />;
        if (action.includes('PROMOTE') || action.includes('FEATURE')) return <Shield size={16} className="text-blue-500" />;
        return <Clock size={16} className="text-gray-500" />;
    };

    const formatAction = (action) => {
        return action.replace(/_/g, ' ');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Audit Logs
                </h2>
                <p className="text-sm text-gray-500 mt-1">Track and monitor all administrative actions for accountability.</p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <Filter size={16} /> Filters:
                </div>
                <select
                    name="action"
                    value={filter.action}
                    onChange={handleFilterChange}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                >
                    <option value="">All Actions</option>
                    <option value="APPROVE_API">Approve API</option>
                    <option value="REJECT_API">Reject API</option>
                    <option value="BAN_USER">Ban User</option>
                    <option value="UNBAN_USER">Unban User</option>
                    <option value="DELETE_API">Delete API</option>
                    <option value="VERIFY_API">Verify API</option>
                </select>

                <select
                    name="target"
                    value={filter.target}
                    onChange={handleFilterChange}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                >
                    <option value="">All Targets</option>
                    <option value="API">API</option>
                    <option value="User">User</option>
                    <option value="Report">Report</option>
                </select>
            </div>

            {/* Logs Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-gray-400 animate-pulse">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12 text-gray-500 font-medium">No logs found.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                    {log.admin?.username?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{log.admin?.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${log.action.includes('BAN') || log.action.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-200' :
                                                    log.action.includes('APPROVE') ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}>
                                                {getActionIcon(log.action)}
                                                {formatAction(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.target} <span className="text-xs text-gray-400 font-mono ml-1">({log.targetId?.slice(-6)})</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <pre className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-100 max-w-xs overflow-x-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
