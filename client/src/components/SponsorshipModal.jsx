import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { X, Check, Zap, Shield, Rocket } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const SponsorshipModal = ({ isOpen, onClose, api }) => {
    const [selectedPlan, setSelectedPlan] = useState('7-days');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !api) return null;

    const plans = [
        {
            id: '7-days',
            name: 'Weekly Boost',
            price: '$10',
            duration: '7 Days',
            features: ['Top of Search Results', 'Verified Badge', 'Priority Support']
        },
        {
            id: '30-days',
            name: 'Monthly Dominance',
            price: '$30',
            duration: '30 Days',
            features: ['Top of Search Results', 'Verified Badge', 'Priority Support', 'Newsletter Feature']
        }
    ];

    const handlePayment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const stripe = await stripePromise;

            const { data } = await axios.post('/api/payment/create-checkout-session', {
                apiId: api._id,
                planId: selectedPlan
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No checkout URL received');
                alert('Payment initialization failed.');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Payment initialization failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 backdrop-blur-sm"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-100">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start justify-between">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold leading-6 text-gray-900 font-heading bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                        Sponsor "{api.name}"
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mb-8">
                                    Boost your API's visibility and reach more developers by sponsoring it. Sponsored APIs appear at the top of search results.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${selectedPlan === plan.id
                                                ? 'border-indigo-600 bg-indigo-50 shadow-lg ring-1 ring-indigo-600'
                                                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                                }`}
                                        >
                                            {selectedPlan === plan.id && (
                                                <div className="absolute top-4 right-4 text-indigo-600">
                                                    <Check size={20} strokeWidth={3} />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap size={20} className={`fill-current ${selectedPlan === plan.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                                            </div>
                                            <div className="text-3xl font-extrabold text-gray-900 mb-4">{plan.price}<span className="text-sm font-medium text-gray-500"> / {plan.duration}</span></div>
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center text-sm text-gray-600">
                                                        <Check size={16} className="text-green-500 mr-2" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">Processing...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Rocket size={16} /> Proceed to Pay</span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SponsorshipModal;
