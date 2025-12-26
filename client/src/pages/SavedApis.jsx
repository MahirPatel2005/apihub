import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Star, Bookmark, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SavedApis = () => {
    const { user, loading: authLoading } = useAuth();
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/auth/bookmarks', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApis(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchBookmarks();
        }
    }, [user, authLoading]);

    const handleRemoveBookmark = async (e, apiId) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/auth/bookmarks/${apiId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic Remove
            setApis(prev => prev.filter(api => api._id !== apiId));
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    if (authLoading) return null;

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Please Log In</h2>
                <p className="mt-2 text-gray-500">You need to be logged in to view your saved APIs.</p>
                <Link to="/login" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md">Log In</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold font-heading text-gray-900">Saved APIs</h1>
                    <p className="mt-2 text-gray-500">Your personal collection of bookmarked tools.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : apis.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apis.map((api) => (
                            <Link key={api._id} to={`/apis/${api._id}`} className="group block h-full">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-100 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1 relative">
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 mb-2 w-fit`}>
                                                    {api.category}
                                                </span>
                                                <h3 className="text-xl font-bold font-heading text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1" title={api.name}>
                                                    {api.name}
                                                </h3>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
                                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 z-10">
                                            <button
                                                onClick={(e) => handleRemoveBookmark(e, api._id)}
                                                className="p-2 rounded-full shadow-sm bg-yellow-50 text-yellow-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Remove from bookmarks"
                                            >
                                                <Bookmark className="h-5 w-5 fill-current" />
                                            </button>
                                        </div>

                                        <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                                            {api.description}
                                        </p>

                                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                                            <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                <CreditCard className="h-3 w-3 mr-1 text-gray-400" />
                                                {api.pricing}
                                            </div>
                                            <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                                                {api.rating?.average?.toFixed(1) || '0.0'} ({api.rating?.count || 0})
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Bookmark className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No saved APIs yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Browse the API list and click the bookmark icon to add them here.</p>
                        <div className="mt-6">
                            <Link to="/apis" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                                Browse APIs
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedApis;
