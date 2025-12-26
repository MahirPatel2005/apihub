import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Save, Edit2, Globe, FileText, Link as LinkIcon } from 'lucide-react';

const Profile = () => {
    const { user, loading: authLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        bio: '',
        website: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user && user.profile) {
            setProfileData({
                bio: user.profile.bio || '',
                website: user.profile.website || '',
                avatar: user.profile.avatar || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };

            const res = await axios.put('http://localhost:5001/api/auth/profile', profileData, config);

            // Optionally update context user here if needed, but page reload/re-fetch works for MVP
            setMessage('Profile updated successfully!');
            setIsEditing(false);
            setLoading(false);
            // In a real app, you'd update the global auth state here
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Failed to update profile.');
            setLoading(false);
        }
    };

    if (authLoading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white shadow rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 h-32 md:h-48"></div>

                <div className="relative px-6 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-6">
                        <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                            {user?.profile?.avatar || profileData.avatar ? (
                                <img
                                    src={user?.profile?.avatar || profileData.avatar}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=User' }}
                                />
                            ) : (
                                <User className="h-16 w-16 text-gray-300" />
                            )}
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{user?.username}</h1>
                            <p className="text-gray-500">{user?.email}</p>
                            <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 md:mt-0">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {isEditing ? 'Cancel' : <><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</>}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        name="bio"
                                        rows="3"
                                        value={profileData.bio}
                                        onChange={handleChange}
                                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Website</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="website"
                                        value={profileData.website}
                                        onChange={handleChange}
                                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="avatar"
                                        value={profileData.avatar}
                                        onChange={handleChange}
                                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Paste a direct link to an image.</p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">About</h3>
                                    <p className="mt-2 text-gray-900 bg-gray-50 p-4 rounded-lg min-h-[5rem]">
                                        {user?.profile?.bio || <span className="text-gray-400 italic">No bio added yet.</span>}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Website</h3>
                                    <p className="mt-2 text-gray-900">
                                        {user?.profile?.website ? (
                                            <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center gap-1">
                                                <Globe className="h-4 w-4" /> {user.profile.website}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">No website added.</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Member Since</dt>
                                        <dd className="text-gray-900 font-medium">
                                            {new Date(user?.createdAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Last Login</dt>
                                        <dd className="text-gray-900 font-medium">Just now</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
