import { Link } from 'react-router-dom';
import {
    Code, Briefcase, Wrench, Heart, Users, ShoppingBag,
    Video, Cloud, Music, Newspaper, Gamepad2, GraduationCap,
    Database, Globe, Shield, Terminal, Truck, Bitcoin
} from 'lucide-react';

const categories = [
    { name: 'Development', icon: <Code className="h-8 w-8 text-indigo-600" />, desc: 'CI/CD, DevOps, and coding tools.', color: 'bg-indigo-50' },
    { name: 'Games & Comics', icon: <Gamepad2 className="h-8 w-8 text-purple-600" />, desc: 'Video games, characters, and fun.', color: 'bg-purple-50' },
    { name: 'Geocoding', icon: <Globe className="h-8 w-8 text-blue-600" />, desc: 'Maps, coordinates, and places.', color: 'bg-blue-50' },
    { name: 'Government', icon: <Briefcase className="h-8 w-8 text-slate-600" />, desc: 'Public sector and civic data.', color: 'bg-slate-50' },
    { name: 'Transportation', icon: <Truck className="h-8 w-8 text-orange-600" />, desc: 'Transit, tracking, and logistics.', color: 'bg-orange-50' },
    { name: 'Cryptocurrency', icon: <Bitcoin className="h-8 w-8 text-yellow-600" />, desc: 'Crypto markets and blockchain.', color: 'bg-yellow-50' },
    { name: 'Finance', icon: <Briefcase className="h-8 w-8 text-green-600" />, desc: 'Banking, crypto, and payment APIs.', color: 'bg-green-50' },
    { name: 'Video', icon: <Video className="h-8 w-8 text-red-600" />, desc: 'Streaming and video processing.', color: 'bg-red-50' },
    { name: 'Social', icon: <Users className="h-8 w-8 text-pink-600" />, desc: 'Social networks and messaging.', color: 'bg-pink-50' },
    { name: 'Security', icon: <Shield className="h-8 w-8 text-gray-800" />, desc: 'Cybersecurity and authentication.', color: 'bg-gray-100' },
    { name: 'Music', icon: <Music className="h-8 w-8 text-teal-600" />, desc: 'Audio, songs, and lyrics.', color: 'bg-teal-50' },
    { name: 'Weather', icon: <Cloud className="h-8 w-8 text-sky-600" />, desc: 'Forecasts and climate data.', color: 'bg-sky-50' },
];

const Categories = () => {
    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold font-heading text-gray-900 mb-4">
                        Browse by Category
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Focus your search. Select a category to see top-rated APIs in that specific domain.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/apis?category=${encodeURIComponent(cat.name)}`}
                            className="group relative overflow-hidden rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full ${cat.color} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>

                            <div className={`${cat.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {cat.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                {cat.name}
                            </h3>
                            <p className="text-gray-500 font-medium">
                                {cat.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;
