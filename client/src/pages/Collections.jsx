import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Star, Bookmark, Folder, FolderPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CollectionModal from '../components/CollectionModal';

const Collections = () => {
    const { user, loading: authLoading } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('collections'); // 'collections' or 'bookmarks'

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch saved bookmarks
                const bookmarksRes = await axios.get('/api/auth/bookmarks', config);
                setBookmarks(bookmarksRes.data);

                // Fetch custom collections
                const collectionsRes = await axios.get('/api/collections', config);
                setCollections(collectionsRes.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    const handleRemoveBookmark = async (e, apiId) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/auth/bookmarks/${apiId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarks(prev => prev.filter(api => api._id !== apiId));
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    const handleDeleteCollection = async (e, id) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this collection?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/collections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    if (authLoading) return null;

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Please Log In</h2>
                <p className="mt-2 text-gray-500">You need to be logged in to view your collections.</p>
                <Link to="/login" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md">Log In</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <CollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCollectionCreated={(newCol) => setCollections([newCol, ...collections])}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-gray-900">My Library</h1>
                        <p className="mt-2 text-gray-500">Manage your saved APIs and custom collections.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <FolderPlus className="h-5 w-5 mr-2" />
                        New Collection
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('collections')}
                            className={`${activeTab === 'collections'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Folder className="h-4 w-4 mr-2" />
                            Collections ({collections.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('bookmarks')}
                            className={`${activeTab === 'bookmarks'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Bookmark className="h-4 w-4 mr-2" />
                            Quick Saves ({bookmarks.length})
                        </button>
                    </nav>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'collections' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {collections.map((collection) => (
                                    <Link key={collection._id} to={`/collections/${collection._id}`} className="group block h-full">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all h-full flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                    <Folder className="h-8 w-8 text-indigo-600" />
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteCollection(e, collection._id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600">{collection.name}</h3>
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{collection.description || 'No description'}</p>
                                            <div className="mt-auto flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                                                <span>{collection.apis?.length || 0} APIs</span>
                                                <span>{collection.isPublic ? 'Public' : 'Private'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {collections.length === 0 && (
                                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <Folder className="mx-auto h-12 w-12 text-gray-300" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No collections yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">Create one to get started!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'bookmarks' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookmarks.map((api) => (
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
                                {bookmarks.length === 0 && (
                                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <Bookmark className="mx-auto h-12 w-12 text-gray-300" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks yet</h3>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Collections;
