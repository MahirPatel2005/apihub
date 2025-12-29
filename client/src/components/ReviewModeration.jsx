import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Trash2, MessageSquare, AlertTriangle } from 'lucide-react';

const ReviewModeration = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5001/api/admin/reviews?page=${page}&limit=12`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(res.data.reviews || []);
            setTotalPages(res.data.pages || 1);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to permanently delete this review?')) return;

        try {
            setActionLoading(reviewId);
            const token = localStorage.getItem('token');
            // Using the existing review deletion route. Assuming /api/apis/:apiId/reviews/:reviewId or check if global delete exists
            // As an admin, we might need a specific admin delete route if the normal one checks for owner match.
            // For now, let's assume we can use a generic admin delete if we had one. 
            // Wait, looking at routes... `apiRoutes.js` might have delete.
            // Actually, best to add a DELETE in adminRoutes for safety or use `reportController` logic.
            // Let's try calling a DELETE on /api/admin/reviews/:id if we add it, or re-use report deletion logic.

            // For this implementation, I will assume we need to add a quick DELETE route or use the report one. 
            // Let's use a hypothetical /api/admin/reviews/:id for now and I'll add it to backend in next step if needed.
            // Actually, I'll add the DELETE route to backend concurrently.

            await axios.delete(`http://localhost:5001/api/admin/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReviews(reviews.filter(r => r._id !== reviewId));
            setActionLoading(null);
        } catch (error) {
            console.error('Delete error', error);
            alert('Failed to delete review');
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Review Moderation
                </h2>
                <p className="text-sm text-gray-500 mt-1">Monitor and moderate all user-submitted reviews.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-48"></div>
                    ))
                ) : reviews.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        No reviews found.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-6 backdrop-blur-xl relative group hover:translate-y-[-2px] transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {review.user?.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{review.user?.username}</div>
                                        <div className="text-xs text-gray-500">on {review.api?.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                    <Star size={12} className="text-yellow-500 fill-current" />
                                    <span className="text-xs font-bold text-yellow-700">{review.rating}</span>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[60px] relative">
                                <MessageSquare size={14} className="absolute -left-2 -top-2 text-gray-200" />
                                "{review.comment}"
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                <button
                                    onClick={() => handleDelete(review._id)}
                                    disabled={actionLoading === review._id}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Review"
                                >
                                    {actionLoading === review._id ? '...' : <Trash2 size={16} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                    Previous
                </button>
                <span className="flex items-center px-4 text-sm font-medium text-gray-600">
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ReviewModeration;
