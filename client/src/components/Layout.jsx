import { Link, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Code, Search, Menu, X, User, LogOut, PlusSquare, Loader } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const wrapperRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await axios.get('/api/apis', {
                    params: { search: searchTerm, limit: 5 }
                });
                setSuggestions(res.data.apis);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            navigate(`/apis?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleSuggestionClick = (apiId) => {
        setSearchTerm('');
        setShowSuggestions(false);
        navigate(`/apis/${apiId}`);
    };

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="bg-primary-50 p-2 rounded-xl group-hover:bg-primary-100 transition-colors">
                                <Code className="h-6 w-6 text-primary-600" />
                            </div>
                            <span className="font-heading font-bold text-2xl text-gray-900 tracking-tight">API<span className="text-primary-600">Hub</span></span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            <Link to="/apis" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Discover
                            </Link>
                            <Link to="/categories" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Categories
                            </Link>
                            <Link to="/community" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Community
                            </Link>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="relative group" ref={wrapperRef}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {isSearching ? (
                                    <Loader className="h-4 w-4 text-primary-500 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                )}
                            </div>
                            <input
                                className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all"
                                placeholder="Search APIs..."
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="max-h-64 overflow-y-auto">
                                        {suggestions.map((api) => (
                                            <div
                                                key={api._id}
                                                onClick={() => handleSuggestionClick(api._id)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group/item border-b border-gray-50 last:border-0"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 group-hover/item:text-primary-600 transition-colors">
                                                        {api.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {api.category} • {api.pricing}
                                                    </span>
                                                </div>
                                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <Code className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        onClick={() => {
                                            setShowSuggestions(false);
                                            navigate(`/apis?search=${encodeURIComponent(searchTerm)}`);
                                        }}
                                        className="px-4 py-2 bg-gray-50 text-xs text-center text-primary-600 font-medium cursor-pointer hover:bg-primary-50 transition-colors"
                                    >
                                        View all results for "{searchTerm}"
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-200"></div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-500 hover:text-primary-600 transition-colors" title="Admin Dashboard">
                                        <div className="bg-primary-100 p-1.5 rounded-lg">
                                            <Code className="h-5 w-5 text-primary-600" />
                                        </div>
                                    </Link>
                                )}
                                <Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors" title="User Dashboard">
                                    <PlusSquare className="h-6 w-6" />
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm ring-2 ring-white shadow-sm">
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                    <Link to="/profile" className="text-xs text-gray-500 hover:text-primary-600">Profile</Link>
                                    <Link to="/saved" className="text-xs text-gray-500 hover:text-primary-600 ml-2">Saved</Link>
                                </div>
                                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">Login</Link>
                                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all transform hover:-translate-y-0.5">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 animate-fade-in">
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        <Link to="/apis" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                            Discover
                        </Link>
                        <Link to="/apis" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                            Categories
                        </Link>
                        <Link to="/community" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                            Community
                        </Link>
                        {!user && (
                            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

const Footer = () => (
    <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-50 p-2 rounded-lg">
                        <Code className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="font-heading font-bold text-xl text-gray-900">API<span className="text-primary-600">Hub</span></span>
                </div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">Twitter</a>
                    <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">GitHub</a>
                    <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">Discord</a>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-100 pt-8 text-center md:text-left">
                <p className="text-gray-400 text-sm">
                    &copy; 2024 API Hub. Crafted for developers.
                </p>
            </div>
        </div>
    </footer>
);

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-primary-100 selection:text-primary-900">
            <Navbar />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
