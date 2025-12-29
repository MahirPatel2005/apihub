import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Edit, Trash2, Shield, AlertTriangle, CheckCircle, XCircle, Star, Slash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApiManagement = () => {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    // Ideally we should have server-side pagination/search for APIs too, 
    // but for now we'll fetch all and filter client-side as per current controller capabilities
    // NOTE: This assumes we updated adminController to return ALL APIs, but we only have getPendingApis.
    // We need to use the public API list or update controller. 
    // For this implementation, I will assume we can fetch all public APIs + pending via separate calls or a new endpoint.
    // Since we didn't add getAllApis for admin, I will use the public /api/apis endpoint which returns active ones,
    // and /api/admin/pending for pending ones, and merge them. 
    // This is a temporary workaround until a proper admin getAllApis is added.

    const fetchApis = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };

            const [publicRes, pendingRes] = await Promise.all([
                axios.get('/api/apis?limit=1000'), // Get as many as possible
                axios.get('/api/admin/pending', config) // Get pending
            ]);

            // Merge and dedup (in case pending became active during fetch)
            const publicApis = publicRes.data.apis;
            const pendingApis = pendingRes.data;

            const allApis = [...pendingApis, ...publicApis];
            // Dedup by ID
            const uniqueApis = Array.from(new Map(allApis.map(item => [item._id, item])).values());

            setApis(uniqueApis);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApis();
    }, []);

    const filteredApis = apis.filter(api =>
        api.name.toLowerCase().includes(search.toLowerCase()) ||
        api.owner?.username?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAttributeUpdate = async (id, attribute, value) => {
        if (!window.confirm(`Are you sure you want to change ${attribute} to ${value}?`)) return;

        setActionLoading(id);
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put(`/api/admin/apis/${id}/attributes`, { attribute, value }, config);

            // Optimistic update
            setApis(prev => prev.map(api => {
                if (api._id === id) {
                    if (attribute === 'status') return { ...api, status: value };
                    return { ...api, [attribute]: value };
                }
                return api;
            }));

        } catch (error) {
            alert('Update failed: ' + (error.response?.data?.message || error.message));
        }
        setActionLoading(null);
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">API Management</h3>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search APIs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                        ) : filteredApis.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">No APIs found</td></tr>
                        ) : (
                            filteredApis.map((api) => (
                                <tr key={api._id} className={api.isDeleted ? 'bg-red-50 opacity-60' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                                    {api.name}
                                                    {api.isVerified && <Shield className="h-3 w-3 text-blue-500" fill="currentColor" />}
                                                    {api.isFeatured && <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />}
                                                </div>
                                                <div className="text-xs text-gray-500">{api.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${api.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                api.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    api.status === 'Deprecated' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {api.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAttributeUpdate(api._id, 'isVerified', !api.isVerified)}
                                                className={`p-1 rounded ${api.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                                                title="Toggle Verification"
                                            >
                                                <Shield size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleAttributeUpdate(api._id, 'isFeatured', !api.isFeatured)}
                                                className={`p-1 rounded ${api.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}
                                                title="Toggle Featured"
                                            >
                                                <Star size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {api.owner?.username || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => navigate(`/apis/${api._id}`)}
                                                className="text-gray-400 hover:text-gray-600"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {api.status !== 'Deprecated' && (
                                                <button
                                                    onClick={() => handleAttributeUpdate(api._id, 'status', 'Deprecated')}
                                                    className="text-orange-500 hover:text-orange-700"
                                                    title="Deprecate"
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>
                                            )}
                                            {!api.isDeleted && (
                                                <button
                                                    onClick={() => handleAttributeUpdate(api._id, 'isDeleted', true)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Soft Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {api.isDeleted && (
                                                <button
                                                    onClick={() => handleAttributeUpdate(api._id, 'isDeleted', false)}
                                                    className="text-green-500 hover:text-green-700"
                                                    title="Restore"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApiManagement;
