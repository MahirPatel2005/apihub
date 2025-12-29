import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, FileText, Shield, Users, Database } from 'lucide-react';

import ApiBookmarksAnalytics from './ApiBookmarksAnalytics';

const OverviewCharts = () => {
    const [stats, setStats] = useState({
        counts: { users: 0, apis: 0, reviews: 0, reports: 0, newApisLast30Days: 0, brokenApiCount: 0 },
        topSearches: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                };
                const { data } = await axios.get('/api/stats/admin', config);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Overview...</div>;

    const { counts, topSearches } = stats;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Dashboard Overview
                </h2>
                <p className="text-sm text-gray-500 mt-1">Real-time metrics and performance insights.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText size={80} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">Total APIs</div>
                        <div className="text-3xl font-bold text-gray-900">{counts.apis}</div>
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                            <Database size={14} className="mr-1" />
                            Across all categories
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={80} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-1">Total Users</div>
                        <div className="text-3xl font-bold text-gray-900">{counts.users}</div>
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                            <Users size={14} className="mr-1" />
                            Active community members
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 p-6 group hover:-translate-y-1 transition-all duration-300 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-100 mb-1">New APIs (30d)</div>
                        <div className="text-3xl font-bold text-white">{counts.newApisLast30Days}</div>
                        <div className="mt-2 flex items-center text-xs text-indigo-100">
                            <Activity size={14} className="mr-1" />
                            Platform Growth Rate
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Shield size={80} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Active Reports</div>
                        <div className="text-3xl font-bold text-gray-900">{counts.reports}</div>
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                            <Shield size={14} className="mr-1" />
                            Requires attention
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
                        Top Search Terms
                    </h3>
                    <div className="h-72">
                        {topSearches.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topSearches} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f3f4f6" />
                                    <XAxis type="number" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="term" type="category" width={80} tick={{ fontSize: 13, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: 'none' }} />
                                    <Bar dataKey="count" fill="#6366f1" name="Searches" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                No search data available yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 p-6 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-50/30"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Broken APIs</h3>
                        <p className="text-sm text-gray-500 mb-4">Reported by users as non-functional</p>
                        <p className="text-5xl font-extrabold text-gray-900">{counts.brokenApiCount}</p>
                    </div>
                </div>

                {/* Bookmarks Analytics */}
                <div className="grid grid-cols-1">
                    <ApiBookmarksAnalytics />
                </div>
            </div>
        </div>
    );
};

export default OverviewCharts;
