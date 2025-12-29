import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X, PlusCircle, ArrowRight, CreditCard, Star, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CollectionDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const token = localStorage.getItem('token');
                // Allow fetching without token if public? For now send token if available
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

                const res = await axios.get(`/api/collections/${id}`, config);
                setCollection(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load collection or unauthorized');
                setLoading(false);
            }
        };
        fetchCollection();
    }, [id]);

    const removeApi = async (e, apiId) => {
        e.preventDefault();
        if (!user || user._id !== collection.owner._id) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/collections/${id}/remove`, { apiId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollection(prev => ({
                ...prev,
                apis: prev.apis.filter(api => api._id !== apiId)
            }));
        } catch (err) {
            console.error('Failed to remove API', err);
        }
    };

    const deleteCollection = async () => {
        if (!window.confirm('Are you sure you want to delete this collection?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/collections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/collections');
        } catch (err) {
            console.error('Failed to delete collection', err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
            <h2 className="text-2xl font-bold text-red-600">{error}</h2>
            <Link to="/collections" className="text-indigo-600 mt-4 inline-block">Back to Collections</Link>
        </div>
    );

    if (!collection) return null;

    const isOwner = user && user._id === collection.owner._id;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/collections" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-8">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Collections
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
                                {collection.isPublic && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Public</span>
                                )}
                            </div>
                            <p className="text-gray-500">{collection.description || 'No description'}</p>
                            <div className="mt-2 text-sm text-gray-400">
                                Created by {collection.owner?.username} • {collection.apis.length} APIs
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {/* Share button could just copy URL */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </button>
                            {isOwner && (
                                <button
                                    onClick={deleteCollection}
                                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collection.apis.map((api) => (
                        <Link key={api._id} to={`/apis/${api._id}`} className="group block h-full">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1 relative">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 mb-2 w-fit`}>
                                                {api.category}
                                            </span>
                                            <h3 className="text-xl font-bold font-heading text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1" title={api.name}>
                                                {api.name}
                                            </h3>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <button
                                                onClick={(e) => removeApi(e, api._id)}
                                                className="p-2 rounded-full shadow-sm bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Remove from collection"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}

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
                    {collection.apis.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <PlusCircle className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Collection is empty</h3>
                            <p className="mt-1 text-sm text-gray-500">Go to APIs page to add some!</p>
                            <div className="mt-6">
                                <Link to="/apis" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                    Browse APIs
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionDetail;
