import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

const ApiForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Utility',
        baseUrl: '',
        authType: 'None',
        authType: 'None',
        protocol: 'REST',
        language: 'Any',
        pricing: 'Free',
        docsUrl: '',
        tags: '',
        endpoints: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            const fetchApi = async () => {
                try {
                    const res = await axios.get(`/api/apis/${id}`);
                    const { name, description, category, baseUrl, authType, pricing, docsUrl, tags, endpoints } = res.data;
                    setFormData({
                        name,
                        description,
                        category,
                        baseUrl,
                        authType,
                        baseUrl,
                        authType,
                        protocol,
                        language,
                        pricing,
                        docsUrl: docsUrl || '',
                        tags: tags.join(', '),
                        endpoints: endpoints || []
                    });
                } catch (err) {
                    console.error('Failed to fetch API details', err);
                }
            };
            fetchApi();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Endpoint Management
    const addEndpoint = () => {
        setFormData({
            ...formData,
            endpoints: [...formData.endpoints, { method: 'GET', path: '', description: '', parameters: [] }]
        });
    };

    const removeEndpoint = (index) => {
        const newEndpoints = [...formData.endpoints];
        newEndpoints.splice(index, 1);
        setFormData({ ...formData, endpoints: newEndpoints });
    };

    const handleEndpointChange = (index, field, value) => {
        const newEndpoints = [...formData.endpoints];
        newEndpoints[index][field] = value;
        setFormData({ ...formData, endpoints: newEndpoints });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(t => t)
            };

            if (isEditMode) {
                await axios.put(`/api/apis/${id}`, payload);
            } else {
                await axios.post('/api/apis', payload);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{isEditMode ? 'Edit API' : 'Submit New API'}</h1>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-8 py-8 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">API Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            {['Finance', 'Health', 'Travel', 'Social', 'E-commerce', 'Utility', 'Other'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Base URL</label>
                    <input type="url" name="baseUrl" required value={formData.baseUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="https://api.example.com" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Auth Type</label>
                        <select name="authType" value={formData.authType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            {['None', 'API Key', 'OAuth', 'Bearer Token'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Protocol</label>
                        <select name="protocol" value={formData.protocol} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            {['REST', 'GraphQL', 'SOAP', 'gRPC', 'WebSocket'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Language</label>
                        <select name="language" value={formData.language} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            {['Any', 'JavaScript', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#'].map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pricing</label>
                        <select name="pricing" value={formData.pricing} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            {['Free', 'Freemium', 'Paid'].map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Documentation URL</label>
                    <input type="url" name="docsUrl" value={formData.docsUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="weather, data, fast" />
                </div>

                {/* Endpoints */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Endpoints</h3>
                        <button type="button" onClick={addEndpoint} className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                            <Plus className="h-4 w-4 mr-1" /> Add Endpoint
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.endpoints.map((ep, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                                <button type="button" onClick={() => removeEndpoint(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="col-span-1">
                                        <select
                                            value={ep.method}
                                            onChange={(e) => handleEndpointChange(idx, 'method', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                        >
                                            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="text"
                                            placeholder="/path/to/resource"
                                            value={ep.path}
                                            onChange={(e) => handleEndpointChange(idx, 'path', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={ep.description}
                                        onChange={(e) => handleEndpointChange(idx, 'description', e.target.value)}
                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? 'Saving...' : 'Save API'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ApiForm;
