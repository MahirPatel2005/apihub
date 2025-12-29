import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5001/api/auth/forgotpassword', { email });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="text-gray-500 mt-2">Enter your email and we'll send you a reset link.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    Send Reset Link <ArrowRight size={16} className="ml-2" />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Check your inbox</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            We've sent a password reset link to <strong>{email}</strong>.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                        >
                            Try another email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
