import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, X, Shield, Activity, Users, FileText } from 'lucide-react';

const Admin = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalApis: 0, pendingApis: 0, totalUsers: 0 });
    const [pendingApis, setPendingApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                };

                const statsRes = await axios.get('http://localhost:5001/api/admin/stats', config);
                setStats(statsRes.data);

                const pendingRes = await axios.get('http://localhost:5001/api/admin/pending', config);
                setPendingApis(pendingRes.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user, authLoading, navigate]);

    const handleStatusUpdate = async (id, status) => {
        setActionLoading(id);
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put(`http://localhost:5001/api/admin/apis/${id}/status`, { status }, config);

            // Remove from list and update stats
            setPendingApis(prev => prev.filter(api => api._id !== id));
            setStats(prev => ({ ...prev, pendingApis: prev.pendingApis - 1, totalApis: prev.totalApis + (status === 'Active' ? 0 : -1) })); // Adjust logic as needed
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
        setActionLoading(null);
    };

    if (authLoading || loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage APIs and Users</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total APIs</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.totalApis}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                    <Activity className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.pendingApis}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending APIs */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Approvals</h3>
                    </div>
                    {pendingApis.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {pendingApis.map((api) => (
                                <li key={api._id} className="p-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-indigo-600 truncate">{api.name}</p>
                                                <p className="text-xs text-gray-500">{new Date(api.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2 truncate">{api.description}</p>
                                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                                                <span className="flex items-center"><Shield className="h-3 w-3 mr-1" /> {api.authType || 'None'}</span>
                                                <span className="px-2 py-0.5 rounded bg-gray-100">{api.category}</span>
                                                <span>By: {api.owner?.username}</span>
                                            </div>
                                            <div className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded truncate">
                                                {api.baseUrl}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(api._id, 'Active')}
                                                disabled={actionLoading === api._id}
                                                className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {actionLoading === api._id ? '...' : <><Check className="h-3 w-3 mr-1" /> Approve</>}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(api._id, 'Rejected')}
                                                disabled={actionLoading === api._id}
                                                className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {actionLoading === api._id ? '...' : <><X className="h-3 w-3 mr-1" /> Reject</>}
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            No pending APIs to review.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
