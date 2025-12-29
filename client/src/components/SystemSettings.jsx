import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, Lock, Server } from 'lucide-react';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        MAINTENANCE_MODE: false,
        GLOBAL_RATE_LIMIT: 100,
        IP_BLOCKLIST: '',
        GLOBAL_PLAYGROUND_ENABLED: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Merge defaults with fetched
            setSettings(prev => ({ ...prev, ...res.data }));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (key, value) => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5001/api/settings',
                { key, value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Setting updated successfully' });
            setTimeout(() => setMessage(null), 3000);
            setSaving(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update setting' });
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    System Settings
                </h2>
                <p className="text-sm text-gray-500 mt-1">Configure global platform behavior and restrictions.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} flex items-center shadow-sm`}>
                    {message.type === 'success' ? <Server size={18} className="mr-2" /> : <AlertTriangle size={18} className="mr-2" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Maintenance Mode Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-6 backdrop-blur-xl hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Maintenance Mode</h3>
                            <p className="text-sm text-gray-500">Block all non-admin access to the platform.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="font-medium text-gray-700">Status</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="MAINTENANCE_MODE"
                                checked={settings.MAINTENANCE_MODE || false}
                                onChange={(e) => {
                                    handleChange(e);
                                    handleSave('MAINTENANCE_MODE', e.target.checked);
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">{settings.MAINTENANCE_MODE ? 'Active' : 'Inactive'}</span>
                        </label>
                    </div>
                </div>

                {/* Rate Limit Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-6 backdrop-blur-xl hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Server size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Global Rate Limit</h3>
                            <p className="text-sm text-gray-500">Max requests per minute per IP address.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            name="GLOBAL_RATE_LIMIT"
                            value={settings.GLOBAL_RATE_LIMIT || 100}
                            onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                        <button
                            onClick={() => handleSave('GLOBAL_RATE_LIMIT', settings.GLOBAL_RATE_LIMIT)}
                            disabled={saving}
                            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Save
                        </button>
                    </div>
                </div>

                {/* IP Blocklist Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-6 backdrop-blur-xl col-span-1 lg:col-span-2 hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">IP Blocklist</h3>
                            <p className="text-sm text-gray-500">Comma-separated list of IP addresses to ban.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <textarea
                            name="IP_BLOCKLIST"
                            value={settings.IP_BLOCKLIST || ''}
                            onChange={handleChange}
                            placeholder="192.168.1.1, 10.0.0.5..."
                            rows="4"
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave('IP_BLOCKLIST', settings.IP_BLOCKLIST)}
                                disabled={saving}
                                className="flex items-center gap-2 text-white bg-gray-900 hover:bg-black font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors shadow-lg shadow-gray-500/20"
                            >
                                <Save size={16} /> Save Blocklist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
