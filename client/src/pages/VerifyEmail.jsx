import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await axios.put(`http://localhost:5001/api/auth/verifyemail/${token}`);
                if (data.success) {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now login.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Invalid or expired token.');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h2>
                        <p className="text-gray-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="text-green-500 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <Link to="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="text-red-500 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <Link to="/login" className="text-indigo-600 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
