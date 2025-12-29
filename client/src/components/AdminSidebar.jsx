import React from 'react';
import { LayoutDashboard, Users, Database, FileText, Settings, LogOut, Code, ShieldCheck, MessageSquare, Layers, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'apis', label: 'API Management', icon: Database },
        { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
        { id: 'reviews', label: 'Reviews', icon: MessageSquare },
        { id: 'content', label: 'Taxonomy', icon: Layers },
        { id: 'broadcast', label: 'Broadcasting', icon: Megaphone },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'logs', label: 'Activity Logs', icon: FileText },
        { id: 'settings', label: 'System Settings', icon: Settings },
    ];

    return (
        <div className="hidden md:flex flex-col w-72 bg-gradient-to-b from-slate-900 to-slate-800 h-screen text-slate-300 shadow-2xl relative z-20 font-sans">
            {/* Header */}
            <div className="flex items-center justify-center h-20 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white">
                    <div className="p-1.5 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Code className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight font-heading">Admin Panel</h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Hub Control</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 space-y-1 scrollbar-hide">
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest pl-6">
                    Main Menu
                </div>
                <nav className="px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`group flex items-center px-4 py-3.5 text-sm font-medium w-full transition-all duration-300 rounded-xl mb-1 relative overflow-hidden ${isActive
                                    ? 'bg-indigo-600/10 text-white shadow-lg shadow-indigo-500/10'
                                    : 'hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                                )}
                                <Icon
                                    className={`mr-3 h-5 w-5 transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`}
                                />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-white/5 bg-slate-900/30">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 border border-transparent hover:border-white/5"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
