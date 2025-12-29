import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ArrowRight, CreditCard, Star, Zap, Filter, Bookmark, Loader, CheckCircle } from 'lucide-react';

const ApiList = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [bookmarks, setBookmarks] = useState([]);
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        category: 'All',
        pricing: 'All',
        authType: 'All',
        protocol: 'All',
        language: 'All',
        sort: 'newest'
    });

    const observer = useRef();
    const lastApiElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Sync filters with URL params
    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const categoryParam = params.get('category');
        if (categoryParam) {
            setFilters(prev => ({ ...prev, category: categoryParam }));
        }

        const searchParam = params.get('search');
        if (searchParam) {
            setSearchTerm(searchParam);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchApis = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/apis', {
                    params: {
                        search: searchTerm,
                        page,
                        limit: 12, // Smaller batch for smoother scroll
                        category: filters.category,
                        pricing: filters.pricing,
                        authType: filters.authType,
                        protocol: filters.protocol,
                        language: filters.language,
                        sort: filters.sort
                    }
                });

                const newApis = res.data.apis;

                // Track Impressions for Sponsored APIs
                const sponsoredIds = newApis.filter(api => api.isSponsored).map(api => api._id);
                if (sponsoredIds.length > 0) {
                    axios.post('/api/apis/track-impressions', { apiIds: sponsoredIds })
                        .catch(err => console.error('Impression tracking failed', err));
                }

                setApis(prevApis => {
                    return page === 1 ? newApis : [...prevApis, ...newApis];
                });
                setHasMore(res.data.page < res.data.pages);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching APIs:', error);
                setLoading(false);
            }
        };

        const fetchBookmarks = async () => {
            if (user && page === 1) { // Only fetch bookmarks once or on refresh
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('/api/auth/bookmarks', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setBookmarks(res.data.map(b => b._id));
                } catch (error) {
                    console.error('Error fetching bookmarks:', error);
                }
            }
        };

        const debounce = setTimeout(() => {
            fetchApis();
        }, 300);

        if (user && page === 1) fetchBookmarks();

        return () => clearTimeout(debounce);
    }, [searchTerm, filters, page, user]); // Depend on page to trigger next fetch

    const handleBookmark = async (e, apiId) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to bookmark APIs');
            return;
        }

        try {
            if (bookmarks.includes(apiId)) {
                setBookmarks(prev => prev.filter(id => id !== apiId));
            } else {
                setBookmarks(prev => [...prev, apiId]);
            }

            const token = localStorage.getItem('token');
            await axios.put(`/api/auth/bookmarks/${apiId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
        setApis([]); // Clear current list to avoid mixing
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
        setApis([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-gray-900">Explore APIs</h1>
                        <p className="mt-2 text-gray-500">Discover the best tools for your next project.</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                        <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="block w-40 border-0 bg-transparent py-1.5 pl-3 pr-8 text-gray-900 focus:ring-0 sm:text-sm font-medium focus:outline-none"
                            >
                                <option value="newest">Newest</option>
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        {/* Search */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Search</h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                    placeholder="Keywords..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Category</h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                                        {['All', 'Development', 'Games & Comics', 'Geocoding', 'Government', 'Transportation', 'Cryptocurrency', 'Finance', 'Video', 'Social', 'Security', 'Music', 'Weather', 'Science & Math', 'Health', 'Animals'].map((cat) => (
                                            <div key={cat} className="flex items-center">
                                                <input
                                                    id={`cat-${cat}`}
                                                    name="category"
                                                    type="radio"
                                                    checked={filters.category === (cat === 'All' ? 'All' : cat)}
                                                    onChange={() => handleFilterChange('category', cat)}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <label htmlFor={`cat-${cat}`} className="ml-3 text-sm text-gray-600 font-medium cursor-pointer">
                                                    {cat}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Pricing</h3>
                                    <div className="space-y-2">
                                        {['All', 'Free', 'Freemium', 'Paid'].map((price) => (
                                            <div key={price} className="flex items-center">
                                                <input
                                                    id={`price-${price}`}
                                                    name="pricing"
                                                    type="radio"
                                                    checked={filters.pricing === (price === 'All' ? 'All' : price)}
                                                    onChange={() => handleFilterChange('pricing', price)}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <label htmlFor={`pricing-${price}`} className="ml-3 text-sm text-gray-600 font-medium cursor-pointer">
                                                    {price}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Authentication</h3>
                                    <div className="space-y-2">
                                        {['All', 'None', 'API Key', 'OAuth', 'Bearer Token'].map((auth) => (
                                            <div key={auth} className="flex items-center">
                                                <input
                                                    id={`auth-${auth}`}
                                                    name="authType"
                                                    type="radio"
                                                    checked={filters.authType === (auth === 'All' ? 'All' : auth)}
                                                    onChange={() => handleFilterChange('authType', auth)}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <label htmlFor={`auth-${auth}`} className="ml-3 text-sm text-gray-600 font-medium cursor-pointer">
                                                    {auth}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Protocol</h3>
                                    <div className="space-y-2">
                                        {['All', 'REST', 'GraphQL', 'SOAP', 'gRPC', 'WebSocket'].map((proto) => (
                                            <div key={proto} className="flex items-center">
                                                <input
                                                    id={`proto-${proto}`}
                                                    name="protocol"
                                                    type="radio"
                                                    checked={filters.protocol === (proto === 'All' ? 'All' : proto)}
                                                    onChange={() => handleFilterChange('protocol', proto)}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <label htmlFor={`proto-${proto}`} className="ml-3 text-sm text-gray-600 font-medium cursor-pointer">
                                                    {proto}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Language</h3>
                                    <div className="space-y-2">
                                        {['All', 'Any', 'JavaScript', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#'].map((lang) => (
                                            <div key={lang} className="flex items-center">
                                                <input
                                                    id={`lang-${lang}`}
                                                    name="language"
                                                    type="radio"
                                                    checked={filters.language === (lang === 'All' ? 'All' : lang)}
                                                    onChange={() => handleFilterChange('language', lang)}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                                />
                                                <label htmlFor={`lang-${lang}`} className="ml-3 text-sm text-gray-600 font-medium cursor-pointer">
                                                    {lang}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1">
                        {apis.length === 0 && loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                                    <p className="text-gray-500 text-sm">Loading amazing APIs...</p>
                                </div>
                            </div>
                        ) : apis.length > 0 ? (
                            <div className="flex flex-col gap-10">
                                {/* Spotlight Section for Sponsored APIs */}
                                {apis.some(api => api.isSponsored) && (
                                    <div className="animate-fade-in">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Zap className="text-yellow-500 fill-current h-6 w-6" />
                                            <h2 className="text-2xl font-bold text-gray-900">Featured APIs</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {apis.filter(api => api.isSponsored).map((api) => (
                                                <Link key={api._id} to={`/apis/${api._id}`} className="group block h-full">
                                                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md border border-purple-100 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-300 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1 relative">
                                                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-20">
                                                            Sponsored
                                                        </div>
                                                        <div className="p-8 flex-1">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="flex flex-col">
                                                                    <div className="flex gap-2 mb-2">
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-primary-700 border border-primary-100 shadow-sm w-fit`}>
                                                                            {api.category}
                                                                        </span>
                                                                    </div>
                                                                    <h3 className="text-2xl font-bold font-heading text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                                                                        {api.name}
                                                                        {api.isVerified && <span className="ml-2 text-blue-500 inline-block" title="Verified"><CheckCircle size={20} className="fill-blue-500 text-white" /></span>}
                                                                    </h3>
                                                                </div>
                                                            </div>

                                                            <p className="text-gray-600 text-base line-clamp-3 mb-6 leading-relaxed">
                                                                {api.description}
                                                            </p>

                                                            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-purple-100">
                                                                <div className="flex items-center text-sm font-medium text-gray-600">
                                                                    <CreditCard className="h-4 w-4 mr-1.5 text-gray-400" />
                                                                    {api.pricing}
                                                                </div>
                                                                <div className="flex items-center text-sm font-medium text-gray-600">
                                                                    <Star className="h-4 w-4 mr-1.5 text-yellow-500 fill-current" />
                                                                    {api.rating?.average?.toFixed(1) || '0.0'} ({api.rating?.count || 0})
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Regular APIs */}
                                <div>
                                    {apis.some(api => api.isSponsored) && <h2 className="text-xl font-bold text-gray-900 mb-6">Latest APIs</h2>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {apis.filter(api => !api.isSponsored).map((api, index) => {
                                            if (index === apis.filter(a => !a.isSponsored).length - 1) {
                                                return (
                                                    <div ref={lastApiElementRef} key={api._id} className="h-full">
                                                        <Link to={`/apis/${api._id}`} className="group block h-full">
                                                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-100 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                                                                <div className="p-6 flex-1">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div className="flex flex-col">
                                                                            <div className="flex gap-2 mb-2">
                                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 w-fit`}>
                                                                                    {api.category}
                                                                                </span>
                                                                            </div>
                                                                            <h3 className="text-xl font-bold font-heading text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1" title={api.name}>
                                                                                {api.name}
                                                                                {api.isVerified && <span className="ml-2 text-blue-500 inline-block" title="Verified"><CheckCircle size={16} className="fill-blue-500 text-white" /></span>}
                                                                            </h3>
                                                                        </div>
                                                                        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
                                                                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                                                                        </div>
                                                                    </div>

                                                                    <div className="absolute top-4 right-4 z-10">
                                                                        <button
                                                                            onClick={(e) => handleBookmark(e, api._id)}
                                                                            className={`p-2 rounded-full shadow-sm transition-colors ${bookmarks.includes(api._id) ? 'bg-yellow-50 text-yellow-500' : 'bg-white text-gray-300 hover:text-yellow-500'}`}
                                                                        >
                                                                            <Bookmark className={`h-5 w-5 ${bookmarks.includes(api._id) ? 'fill-current' : ''}`} />
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
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <Link key={api._id} to={`/apis/${api._id}`} className="group block h-full">
                                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-100 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                                                            <div className="p-6 flex-1">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="flex flex-col">
                                                                        <div className="flex gap-2 mb-2">
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 w-fit`}>
                                                                                {api.category}
                                                                            </span>
                                                                        </div>
                                                                        <h3 className="text-xl font-bold font-heading text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1" title={api.name}>
                                                                            {api.name}
                                                                            {api.isVerified && <span className="ml-2 text-blue-500 inline-block" title="Verified"><CheckCircle size={16} className="fill-blue-500 text-white" /></span>}
                                                                        </h3>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
                                                                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                                                                    </div>
                                                                </div>

                                                                <div className="absolute top-4 right-4 z-10">
                                                                    <button
                                                                        onClick={(e) => handleBookmark(e, api._id)}
                                                                        className={`p-2 rounded-full shadow-sm transition-colors ${bookmarks.includes(api._id) ? 'bg-yellow-50 text-yellow-500' : 'bg-white text-gray-300 hover:text-yellow-500'}`}
                                                                    >
                                                                        <Bookmark className={`h-5 w-5 ${bookmarks.includes(api._id) ? 'fill-current' : ''}`} />
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
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <Search className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No APIs found</h3>
                                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilters({
                                                category: 'All',
                                                pricing: 'All',
                                                authType: 'All',
                                                protocol: 'All',
                                                language: 'All',
                                                sort: 'newest'
                                            });
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiList;
