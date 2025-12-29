import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiBookmarksAnalytics = () => {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:5001/api/admin/analytics/bookmarks', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApis(data);
            } catch (error) {
                console.error('Error fetching bookmark analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
                Most Bookmarked APIs
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-3 rounded-l-lg">API Name</th>
                            <th className="px-6 py-3">Owner</th>
                            <th className="px-6 py-3">Bookmarks</th>
                            <th className="px-6 py-3 rounded-r-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apis.length > 0 ? apis.map((api) => (
                            <tr key={api._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-pink-50 text-pink-500 rounded-lg">
                                            <Bookmark size={16} />
                                        </div>
                                        {api.name}
                                        {api.isSponsored && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 ml-2">PRO</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {api.owner?.username || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {api.bookmarksCount}
                                </td>
                                <td className="px-6 py-4">
                                    <Link to={`/apis/${api._id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 text-xs font-bold">
                                        View <ExternalLink size={12} />
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-400">
                                    No bookmark data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApiBookmarksAnalytics;
