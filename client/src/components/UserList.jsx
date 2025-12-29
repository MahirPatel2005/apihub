import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MoreVertical, Shield, Ban, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await axios.get(`/api/admin/users?page=${page}&limit=10&search=${search}`, config);
            setUsers(data.users);
            setTotalPages(data.pages);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search]);

    const handleAction = async (userId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setActionLoading(userId);
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put(`/api/admin/users/${userId}/status`, { action }, config);
            fetchUsers(); // Refresh list
        } catch (error) {
            alert('Action failed: ' + (error.response?.data?.message || error.message));
        }
        setActionLoading(null);
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">No users found</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {user.isBanned ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleAction(user._id, 'promote')}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Promote to Admin"
                                                    disabled={actionLoading === user._id}
                                                >
                                                    <Shield size={16} />
                                                </button>
                                            )}
                                            {user.role === 'admin' && (
                                                <button
                                                    onClick={() => handleAction(user._id, 'demote')}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Demote to User"
                                                    disabled={actionLoading === user._id}
                                                >
                                                    <UserCheck size={16} />
                                                </button>
                                            )}
                                            {user.isBanned ? (
                                                <button
                                                    onClick={() => handleAction(user._id, 'unban')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Unban"
                                                    disabled={actionLoading === user._id}
                                                >
                                                    <UserCheck size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction(user._id, 'ban')}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Ban"
                                                    disabled={actionLoading === user._id}
                                                >
                                                    <Ban size={16} />
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

            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;
