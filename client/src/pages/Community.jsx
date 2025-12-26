import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Heart, Shield, Plus, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';

const Community = () => {
    const { user } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '💬' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // If public, might not need auth, but list usually requires it
            if (user) {
                const { data } = await axios.get('api/communities', config);
                console.log('Fetched communities:', data);
                setCommunities(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching communities', error);
            setCommunities([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('api/communities', formData, config);
            setCommunities([data, ...communities]);
            setShowCreateModal(false);
            setFormData({ name: '', description: '', icon: '💬' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating community');
        }
    };

    const joinCommunity = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`api/communities/${id}/join`, {}, config);
            // Refresh list to update member count/status
            fetchCommunities();
            // Select it to chat
            const community = communities.find(c => c._id === id);
            setSelectedCommunity(community);
        } catch (error) {
            console.error('Error joining community', error);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Community</h2>
                    <p className="text-gray-600 mb-8">Login to chat with other developers and join groups.</p>
                    <Link to="/login" className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-700 transition-colors">
                        Login / Register
                    </Link>
                </div>
            </div>
        );
    }

    if (selectedCommunity) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ChatRoom community={selectedCommunity} goBack={() => setSelectedCommunity(null)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-gray-900">Community Groups</h1>
                        <p className="text-gray-600 mt-2">Join a group to chat, share ideas, and collaborate.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                        Create Group
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communities.map((community) => (
                            <div key={community._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                                        {community.icon}
                                    </div>
                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {community.members.length} members
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{community.name}</h3>
                                <p className="text-gray-500 mb-6 line-clamp-2 h-12">{community.description}</p>

                                {community.members.includes(user.id) ? (
                                    <button
                                        onClick={() => setSelectedCommunity(community)}
                                        className="w-full bg-primary-50 text-primary-700 py-2.5 rounded-lg font-medium hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Open Chat
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => joinCommunity(community._id)}
                                        className="w-full bg-white border border-primary-600 text-primary-600 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                                    >
                                        Join Group
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-xl">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Group</h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., React Developers"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24"
                                    placeholder="What is this group about?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="💬"
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
                                Create Group
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;
