import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Globe, Shield, CreditCard, Clock, Activity, Copy, Check, MessageSquare, Star, Flag, ThumbsUp, ThumbsDown, FolderPlus } from 'lucide-react';
import ReportModal from '../components/ReportModal';
import AddToCollectionModal from '../components/AddToCollectionModal';
import SEO from '../components/SEO';
import ApiPlayground from '../components/ApiPlayground';

const ApiDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [api, setApi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Playground State
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [userPros, setUserPros] = useState('');
    const [userCons, setUserCons] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState({ type: 'API', id: null });

    // Collection Modal State
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

    useEffect(() => {
        const fetchApi = async () => {
            try {
                const res = await axios.get(`/api/apis/${id}`);
                setApi(res.data);

                // Fetch reviews
                const reviewsRes = await axios.get(`/api/apis/${id}/reviews`);
                setReviews(reviewsRes.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load API details');
                setLoading(false);
            }
        };
        fetchApi();
    }, [id]);

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleEndpointData = (endpoint) => {
        setSelectedEndpoint(endpoint);
        // Scroll to playground
        document.getElementById('playground').scrollIntoView({ behavior: 'smooth' });
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to review');
        setSubmittingReview(true);
        setReviewError('');
        try {
            const res = await axios.post(`/api/apis/${id}/reviews`, {
                rating: userRating,
                comment: userComment,
                pros: userPros.split('\n').filter(s => s.trim()),
                cons: userCons.split('\n').filter(s => s.trim())
            });
            setReviews([res.data, ...reviews]);
            setUserComment('');
            setUserPros('');
            setUserCons('');
            // Update API rating locally or refetch
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        }
        setSubmittingReview(false);
    };

    const openReportModal = (type, targetId) => {
        if (!user) return alert('Please login to report');
        setReportTarget({ type, id: targetId });
        setIsReportModalOpen(true);
    };

    const openCollectionModal = () => {
        if (!user) return alert('Please login to save to a collection');
        setIsCollectionModalOpen(true);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
            <h2 className="text-2xl font-bold text-red-600">{error}</h2>
            <Link to="/apis" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
                Back to APIs
            </Link>
        </div>
    );

    if (!api) return null;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <SEO
                title={api.name}
                description={api.description}
                keywords={`${api.name}, ${api.category}, api, public api`}
            />
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                apiId={id}
                reviewId={reportTarget.type === 'Review' ? reportTarget.id : null}
                type={reportTarget.type}
            />
            <AddToCollectionModal
                isOpen={isCollectionModalOpen}
                onClose={() => setIsCollectionModalOpen(false)}
                apiId={id}
            />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link to="/apis" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to APIs
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <h1 className="text-4xl font-bold font-heading text-gray-900">{api.name}</h1>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${api.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {api.status}
                                </span>
                            </div>
                            <p className="text-xl text-gray-500 max-w-3xl leading-relaxed">{api.description}</p>
                            <div className="mt-6 flex flex-wrap gap-4">
                                <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                                    {api.category}
                                </div>
                                <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                                    {api.authType || 'No Auth'}
                                </div>
                                <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                                    {api.pricing}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={openCollectionModal}
                                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-0.5"
                                >
                                    <FolderPlus className="h-5 w-5 mr-2 text-indigo-500" />
                                    Add to Collection
                                </button>
                                <a
                                    href={api.docsUrl || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-0.5"
                                >
                                    Official Docs
                                </a>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <div className="text-center text-xs text-gray-400">
                                    By {api.owner?.username || 'Unknown'}
                                </div>
                                <button
                                    onClick={() => openReportModal('API', api._id)}
                                    className="text-xs text-red-400 hover:text-red-600 flex items-center"
                                >
                                    <Flag className="h-3 w-3 mr-1" /> Report API
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Base URL */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Base URL</h3>
                                <div className="mt-2 flex rounded-md shadow-sm">
                                    <div className="relative flex-grow focus-within:z-10">
                                        <input
                                            type="text"
                                            readOnly
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 text-gray-500"
                                            value={api.baseUrl}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(api.baseUrl, 'base')}
                                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {copiedIndex === 'base' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Endpoints */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Endpoints</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {api.endpoints?.map((endpoint, idx) => (
                                    <li key={idx} className="px-4 py-5 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEndpointData(endpoint)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                                    endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                                                        endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {endpoint.method}
                                                </span>
                                                <code className="text-sm font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded">
                                                    {endpoint.path}
                                                </code>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>

                                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                                            <div className="mt-4 bg-gray-50 rounded-md p-3">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parameters</h4>
                                                <div className="space-y-2">
                                                    {endpoint.parameters.map((param, pIdx) => (
                                                        <div key={pIdx} className="flex items-start text-sm">
                                                            <span className="font-mono text-indigo-600 w-24 shrink-0">{param.name}</span>
                                                            <span className="text-gray-400 w-20 shrink-0 text-xs">{param.paramType}</span>
                                                            <span className="text-gray-500">{param.description}</span>
                                                            {param.required && <span className="ml-2 text-xs text-red-500 font-medium">Required</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Playground Section */}
                        <div id="playground">
                            {api.playgroundEnabled !== false ? (
                                <ApiPlayground api={api} prefillEndpoint={selectedEndpoint} />
                            ) : (
                                <div className="bg-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                                    <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                                        <Shield className="h-full w-full" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Playground Unavailable</h3>
                                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                        The owner of this API has disabled the interactive playground.
                                        Please rely on the official documentation for testing.
                                    </p>
                                    {api.docsUrl && (
                                        <a
                                            href={api.docsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            View Documentation &rarr;
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-indigo-100 mt-8">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-indigo-50">
                                <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                                    Community Reviews
                                </h3>
                            </div>
                            <div className="p-6">
                                {user && (
                                    <form onSubmit={submitReview} className="mb-8 bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-bold text-gray-700 mb-2">Write a review</h4>
                                        {reviewError && <p className="text-red-500 text-sm mb-2">{reviewError}</p>}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setUserRating(star)}
                                                        className={`focus:outline-none ${star <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        <Star className="h-6 w-6 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-green-600 mb-1">Pros (one per line)</label>
                                                <textarea
                                                    rows={3}
                                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-xs"
                                                    value={userPros}
                                                    onChange={(e) => setUserPros(e.target.value)}
                                                    placeholder="Fast response&#10;Good documentation"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-red-600 mb-1">Cons (one per line)</label>
                                                <textarea
                                                    rows={3}
                                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-xs"
                                                    value={userCons}
                                                    onChange={(e) => setUserCons(e.target.value)}
                                                    placeholder="Expensive&#10;Rate limited"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Comment</label>
                                            <textarea
                                                required
                                                rows={3}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={userComment}
                                                onChange={(e) => setUserComment(e.target.value)}
                                                placeholder="Share your experience..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {submittingReview ? 'Posting...' : 'Post Review'}
                                        </button>
                                    </form>
                                )}

                                <div className="space-y-6">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                            {review.user?.username?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="ml-2 text-sm font-medium text-gray-900">{review.user?.username}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                        <button
                                                            onClick={() => openReportModal('Review', review._id)}
                                                            className="text-gray-400 hover:text-red-500"
                                                            title="Report Review"
                                                        >
                                                            <Flag className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>

                                                {/* Pros & Cons */}
                                                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                                                    <div className="flex gap-4 mb-3 text-xs">
                                                        {review.pros?.length > 0 && (
                                                            <div className="flex-1">
                                                                <h5 className="font-bold text-green-700 mb-1 flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> Pros</h5>
                                                                <ul className="list-disc list-inside text-gray-600 pl-1">
                                                                    {review.pros.map((p, i) => <li key={i}>{p}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {review.cons?.length > 0 && (
                                                            <div className="flex-1">
                                                                <h5 className="font-bold text-red-700 mb-1 flex items-center gap-1"><ThumbsDown className="h-3 w-3" /> Cons</h5>
                                                                <ul className="list-disc list-inside text-gray-600 pl-1">
                                                                    {review.cons.map((c, i) => <li key={i}>{c}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-sm text-gray-600">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">No reviews yet. Be the first to review!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
                            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                        <Activity className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Views</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{api.stats?.views || 0}</dd>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">API Calls</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{api.stats?.calls || 0}</dd>
                                    </div>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Summary</h3>
                            <div className="flex items-center items-baseline">
                                <span className="text-3xl font-bold text-gray-900">{api.rating?.average || 0}</span>
                                <span className="ml-1 text-sm text-gray-500">/ 5</span>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(api.rating?.average || 0) * 20}%` }}></div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">{api.rating?.count || 0} reviews</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiDetail;
