import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import OverviewCharts from '../components/OverviewCharts';
import UserList from '../components/UserList';
import ApiManagement from '../components/ApiManagement';
import PendingApprovals from '../components/PendingApprovals';
import ReportManagement from '../components/ReportManagement';
import ReviewModeration from '../components/ReviewModeration';
import CategoryManager from '../components/CategoryManager';
import AnnouncementManager from '../components/AnnouncementManager';
import AuditLogs from '../components/AuditLogs';
import SystemSettings from '../components/SystemSettings';
import { Menu } from 'lucide-react';

const Admin = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    if (authLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar for Desktop */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-indigo-900 text-white z-50 flex items-center justify-between px-4 h-16 shadow-md">
                <span className="font-bold text-lg">Admin Panel</span>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-900">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <div className="text-white">X</div>
                            </button>
                        </div>
                        <AdminSidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />
                    </div>
                    <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:pl-0 pt-16 md:pt-0 overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
                                {activeTab.replace(/([A-Z])/g, ' $1').trim()}
                            </h1>
                        </div>

                        {activeTab === 'overview' && <OverviewCharts />}
                        {activeTab === 'users' && <UserList />}
                        {activeTab === 'apis' && <ApiManagement />}
                        {activeTab === 'approvals' && <PendingApprovals />}
                        {activeTab === 'reviews' && <ReviewModeration />}
                        {activeTab === 'content' && <CategoryManager />}
                        {activeTab === 'broadcast' && <AnnouncementManager />}
                        {activeTab === 'reports' && <ReportManagement />}
                        {activeTab === 'logs' && <AuditLogs />}
                        {activeTab === 'settings' && <SystemSettings />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Admin;
