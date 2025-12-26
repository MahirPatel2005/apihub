import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyApis = async () => {
            try {
                // Token is already in headers via AuthContext
                const res = await axios.get('http://localhost:5001/api/apis/my/apis');
                setApis(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching my APIs:', error);
                setLoading(false);
            }
        };

        fetchMyApis();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this API?')) {
            try {
                await axios.delete(`http://localhost:5001/api/apis/${id}`);
                setApis(apis.filter(api => api._id !== id));
            } catch (error) {
                console.error('Error deleting API:', error);
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My APIs</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your submitted APIs</p>
                </div>
                <Link
                    to="/add-api"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Submit New API
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {apis.length > 0 ? (
                        apis.map((api) => (
                            <li key={api._id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{api.name}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${api.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {api.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{api.description}</p>
                                        <div className="flex items-center text-sm text-gray-500 gap-4">
                                            <span>Views: {api.stats?.views || 0}</span>
                                            <span>Calls: {api.stats?.calls || 0}</span>
                                        </div>
                                    </div>
                                    <div className="ml-6 flex items-center gap-3">
                                        <Link to={`/apis/${api._id}`} className="text-gray-400 hover:text-gray-600">
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link to={`/edit-api/${api._id}`} className="text-indigo-400 hover:text-indigo-600">
                                            <Edit2 className="h-5 w-5" />
                                        </Link>
                                        <button onClick={() => handleDelete(api._id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="px-4 py-12 text-center text-gray-500">
                            You haven't submitted any APIs yet.
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
