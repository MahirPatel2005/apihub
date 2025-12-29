import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SponsorshipModal from '../components/SponsorshipModal';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [apis, setApis] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ summary: {}, details: [] });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Sponsorship
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);
    const [selectedApiForSponsorship, setSelectedApiForSponsorship] = useState(null);
    const [expandedAnalyticsId, setExpandedAnalyticsId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Token is already in headers via AuthContext
                const apisRes = await axios.get('/api/apis/my/apis');
                setApis(apisRes.data);

                const reviewsRes = await axios.get('/api/apis/my/reviews');
                setReviews(reviewsRes.data);

                const statsRes = await axios.get('/api/stats/mine');
                setStats(statsRes.data); // { summary, details }

                setLoading(false);

                // Check for payment success
                if (searchParams.get('payment_success')) {
                    const apiId = searchParams.get('api_id');
                    // Verify payment status with backend just to be sure (optional, backend verification handled via webhook or verify-session usually)
                    // For now, let's verify via the manual endpoint we made
                    const sessionId = searchParams.get('session_id');
                    if (sessionId) {
                        try {
                            await axios.get(`/api/payment/verify-session?session_id=${sessionId}`);
                            alert('Payment successful! Your API is now Sponsored.');
                            // Remove query params
                            navigate('/dashboard', { replace: true });
                            // Reload data to show updated status
                            const updatedApis = await axios.get('/api/apis/my/apis');
                            setApis(updatedApis.data);
                        } catch (err) {
                            console.error('Verification failed', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams, navigate]);

    const handleDeleteApi = async (id) => {
        if (window.confirm('Are you sure you want to delete this API?')) {
            try {
                await axios.delete(`/api/apis/${id}`);
                setApis(apis.filter(api => api._id !== id));
            } catch (error) {
                console.error('Error deleting API:', error);
                alert('Failed to delete API');
            }
        }
    };

    const handleOpenSponsorship = (api) => {
        setSelectedApiForSponsorship(api);
        setIsSponsorshipModalOpen(true);
    };

    const handleDeleteReview = async (review) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                // review.api is populated with object or just id? check controller. Review.find().populate('api', 'name')
                // if populate is just name, we might not have _id if we don't request it?
                // Mongoose populate includes _id by default unless deselected.
                // So review.api._id should be there.
                await axios.delete(`/api/apis/${review.api._id}/reviews/${review._id}`);
                setReviews(reviews.filter(r => r._id !== review._id));
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Failed to delete review');
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your contributions and activity</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/collections"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Manage Collections
                    </Link>
                    <Link
                        to="/add-api"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Submit New API
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('apis')}
                        className={`${activeTab === 'apis' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        My APIs ({apis.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`${activeTab === 'reviews' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        My Reviews ({reviews.length})
                    </button>
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.summary?.totalViews || 0}</dd>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total API Calls</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.summary?.totalCalls || 0}</dd>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.summary?.avgRating?.toFixed(1) || 'N/A'}</dd>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">Active APIs</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.summary?.totalApis || 0}</dd>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">API Performance (Views)</h3>
                        <div className="h-80">
                            {stats.details?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.details} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="stats.views" fill="#4f46e5" name="Views" />
                                        <Bar dataKey="stats.calls" fill="#10b981" name="Calls" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    No data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'apis' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md animate-in fade-in duration-300">
                    <ul className="divide-y divide-gray-200">
                        {apis.length > 0 ? (
                            apis.map((api) => (
                                <li key={api._id} className="flex flex-col">
                                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-indigo-600 truncate">{api.name}</p>
                                                    {api.isSponsored && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                            <Zap className="w-3 h-3 mr-1 fill-current" /> Sponsored
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                                                    <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full gap-1 ${api.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {api.status}
                                                    </span>
                                                    {api.isSponsored && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200" title={`Sponsored until ${new Date(api.sponsoredUntil).toLocaleDateString()}`}>
                                                            <Zap className="w-3 h-3 mr-1 fill-current" />
                                                            Sponsored ({Math.max(0, Math.ceil((new Date(api.sponsoredUntil) - new Date()) / (1000 * 60 * 60 * 24)))}d left)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{api.description}</p>
                                            <div className="flex items-center text-sm text-gray-500 gap-4">
                                                <span>Views: {api.stats?.views || 0}</span>
                                                <span>Calls: {api.stats?.calls || 0}</span>
                                                {api.isSponsored && (
                                                    <>
                                                        <span className="text-purple-600 font-medium">Impressions: {api.analytics?.impressions || 0}</span>
                                                        <span className="text-purple-600 font-medium">Clicks: {api.analytics?.clicks || 0}</span>
                                                    </>
                                                )}
                                                {/* Playground Stats Badge */}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${api.playgroundEnabled ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Playground: {api.playgroundEnabled ? 'On' : 'Off'}
                                                    {api.playgroundStats?.totalRequests > 0 && (
                                                        <span className="ml-1 border-l border-indigo-200 pl-1">
                                                            {api.playgroundStats.totalRequests} reqs • {api.playgroundStats.avgResponseTime}ms avg
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-6 flex items-center gap-3">
                                            {/* Analytics Toggle for Sponsored APIs */}
                                            {api.isSponsored && (
                                                <button
                                                    onClick={() => setExpandedAnalyticsId(expandedAnalyticsId === api._id ? null : api._id)}
                                                    className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md transition-colors ${expandedAnalyticsId === api._id
                                                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Campaign
                                                </button>
                                            )}

                                            {!api.isSponsored && (
                                                <button
                                                    onClick={() => handleOpenSponsorship(api)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-purple-200 text-xs font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                                                >
                                                    <Zap className="h-3 w-3 mr-1" />
                                                    Sponsor
                                                </button>
                                            )}
                                            <Link to={`/apis/${api._id}`} className="text-gray-400 hover:text-gray-600">
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                            <Link to={`/edit-api/${api._id}`} className="text-indigo-400 hover:text-indigo-600">
                                                <Edit2 className="h-5 w-5" />
                                            </Link>
                                            <button onClick={() => handleDeleteApi(api._id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Campaign Performance Chart Section */}
                                    {expandedAnalyticsId === api._id && api.isSponsored && (
                                        <div className="bg-gray-50 p-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900">Campaign Performance</h4>
                                                    <p className="text-sm text-gray-500">Real-time impact of your sponsorship</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                                        <span className="block text-xs text-gray-400 uppercase font-bold">CTR</span>
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {((api.analytics?.clicks / (api.analytics?.impressions || 1)) * 100).toFixed(2)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-64 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart
                                                        data={api.analytics?.dailyStats?.map(d => ({
                                                            ...d,
                                                            date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                                        })) || []}
                                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                        <XAxis
                                                            dataKey="date"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                            dy={10}
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Legend />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="impressions"
                                                            name="Impressions"
                                                            stroke="#8b5cf6"
                                                            strokeWidth={3}
                                                            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="clicks"
                                                            name="Clicks"
                                                            stroke="#ec4899"
                                                            strokeWidth={3}
                                                            dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="views"
                                                            name="Total Views"
                                                            stroke="#94a3b8"
                                                            strokeWidth={2}
                                                            strokeDasharray="5 5"
                                                            dot={false}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))
                        ) : (
                            <div className="px-4 py-12 text-center text-gray-500">
                                You haven't submitted any APIs yet.
                            </div>
                        )}
                    </ul>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md animate-in fade-in duration-300">
                    <ul className="divide-y divide-gray-200">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <li key={review._id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">
                                                    Review for: <Link to={`/apis/${review.api?._id}`} className="text-indigo-600 hover:underline">{review.api?.name || 'Unknown API'}</Link>
                                                </h4>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {/* Simple Stars */}
                                                    <div className="flex text-yellow-400">
                                                        <span>★</span><span>{review.rating}/5</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">"{review.comment}"</p>
                                            </div>
                                            <div>
                                                <button onClick={() => handleDeleteReview(review)} className="text-red-400 hover:text-red-600 p-2">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="px-4 py-12 text-center text-gray-500">
                                You haven't written any reviews yet.
                            </div>
                        )}
                    </ul>
                </div>
            )}

            {/* Sponsorship Modal */}
            <SponsorshipModal
                isOpen={isSponsorshipModalOpen}
                onClose={() => setIsSponsorshipModalOpen(false)}
                api={selectedApiForSponsorship}
            />
        </div>
    );
};

export default Dashboard;
