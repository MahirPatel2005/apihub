import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Globe, Shield, Search } from 'lucide-react';
import SEO from '../components/SEO';

const Home = () => {
    return (
        <div className="overflow-hidden">
            <SEO />
            {/* Hero Section */}
            <div className="relative pt-16 pb-32 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-slate-50">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-600 mb-8 border border-primary-100 animate-fade-in">
                            <span className="flex h-2 w-2 relative mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            v1.0 is now live
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-gray-900 mb-6 animate-slide-up">
                            The Marketplace for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Public APIs</span>
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10 animate-slide-up animation-delay-100">
                            Discover, test, and integrate thousands of verified public APIs. Join 10,000+ developers building the next generation of apps.
                        </p>
                        <div className="flex justify-center gap-4 animate-slide-up animation-delay-200">
                            <Link
                                to="/apis"
                                className="px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-600/50 hover:-translate-y-1"
                            >
                                Explore APIs
                            </Link>
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all hover:border-gray-300"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-2">Features</h2>
                        <h3 className="text-3xl md:text-4xl font-bold font-heading text-gray-900">Everything you need to build better</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                name: 'Instant Discovery',
                                description: 'Find the API you need in seconds with our powerful search and real-time filtering system.',
                                icon: Search,
                                color: 'bg-blue-500'
                            },
                            {
                                name: 'Reliable & Verified',
                                description: 'All APIs are manually verified for uptime, security, and documentation quality.',
                                icon: Shield,
                                color: 'bg-green-500'
                            },
                            {
                                name: 'High Performance',
                                description: 'Test endpoints directly in your browser with our low-latency global proxy network.',
                                icon: Zap,
                                color: 'bg-amber-500'
                            },
                        ].map((feature, idx) => (
                            <div key={feature.name} className="relative group p-8 bg-slate-50 rounded-3xl hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                                <div className={`absolute top-8 left-8 h-12 w-12 rounded-2xl ${feature.color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <h3 className="mt-16 text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{feature.name}</h3>
                                <p className="mt-4 text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
