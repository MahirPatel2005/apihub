import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, FileJson, Link as LinkIcon, Download } from 'lucide-react';
import yaml from 'js-yaml';

const ApiForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [importContent, setImportContent] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');

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
        playgroundEnabled: true,
        endpoints: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            const fetchApi = async () => {
                try {
                    const res = await axios.get(`/api/apis/${id}`);
                    const { name, description, category, baseUrl, authType, pricing, docsUrl, tags, endpoints, protocol, language, playgroundEnabled } = res.data;
                    setFormData({
                        name,
                        description,
                        category,
                        baseUrl,
                        authType,
                        protocol,
                        language,
                        pricing,
                        docsUrl: docsUrl || '',
                        tags: Array.isArray(tags) ? tags.join(', ') : tags,
                        playgroundEnabled: playgroundEnabled !== undefined ? playgroundEnabled : true,
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

    const processImport = (content) => {
        try {
            const doc = typeof content === 'string' ? yaml.load(content) : content;
            if (!doc) throw new Error('Invalid format');

            // Extraction Logic
            const name = doc.info?.title || formData.name;
            const description = doc.info?.description || formData.description;
            let baseUrl = formData.baseUrl;
            if (doc.servers && doc.servers.length > 0) {
                baseUrl = doc.servers[0].url;
            } else if (doc.host) {
                const scheme = (doc.schemes && doc.schemes[0]) || 'https';
                baseUrl = `${scheme}://${doc.host}${doc.basePath || ''}`;
            }

            const endpoints = [];
            if (doc.paths) {
                Object.entries(doc.paths).forEach(([path, methods]) => {
                    Object.entries(methods).forEach(([method, details]) => {
                        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
                            const params = (details.parameters || []).map(p => ({
                                name: p.name,
                                paramType: p.in === 'path' ? 'String' : p.type === 'integer' ? 'Number' : 'String', // Simplified mapping
                                required: p.required || false,
                                description: p.description || ''
                            }));

                            endpoints.push({
                                method: method.toUpperCase(),
                                path: path,
                                description: details.summary || details.description || '',
                                parameters: params
                            });
                        }
                    });
                });
            }

            setFormData(prev => ({
                ...prev,
                name: name || prev.name,
                description: description || prev.description,
                baseUrl: baseUrl || prev.baseUrl,
                endpoints: endpoints.length > 0 ? endpoints : prev.endpoints
            }));

            setIsImportModalOpen(false);
            setImportUrl('');
            setImportContent('');
        } catch (err) {
            console.error(err);
            setImportError('Failed to parse OpenAPI/Swagger file. Ensure it is valid JSON or YAML.');
        }
    };

    const handleUrlImport = async () => {
        if (!importUrl) return;
        setImportLoading(true);
        setImportError('');
        try {
            // Use our proxy to avoid CORS
            const res = await axios.post('/api/proxy', {
                url: importUrl,
                method: 'GET'
            });
            processImport(res.data.data); // Proxy returns { data: response.data }
        } catch (err) {
            setImportError('Failed to fetch from URL. Make sure it is publicly accessible.');
        }
        setImportLoading(false);
    };

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => processImport(e.target.result);
        reader.readAsText(file);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Edit API' : 'Submit New API'}</h1>
                <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Import OpenAPI
                </button>
            </div>

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsImportModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                                    <FileJson className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Import OpenAPI / Swagger</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Auto-fill details by importing a JSON or YAML definition file.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {importError && (
                                <div className="mt-4 bg-red-50 p-3 rounded-md text-sm text-red-600">
                                    {importError}
                                </div>
                            )}

                            <div className="mt-5 space-y-4">
                                <div className="border-t border-b border-gray-200 py-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Import from URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={importUrl}
                                            onChange={(e) => setImportUrl(e.target.value)}
                                            placeholder="https://api.example.com/openapi.json"
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleUrlImport}
                                            disabled={importLoading || !importUrl}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {importLoading ? 'Fetching...' : 'Fetch'}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-center text-sm text-gray-500 font-medium">- OR -</div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors cursor-pointer relative">
                                        <div className="space-y-1 text-center">
                                            <FileJson className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".json,.yaml,.yml" onChange={handleFileImport} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">JSON or YAML</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Paste Content</label>
                                    <textarea
                                        rows={4}
                                        value={importContent}
                                        onChange={(e) => setImportContent(e.target.value)}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono text-xs"
                                        placeholder='{"openapi": "3.0.0", "info": ...}'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => processImport(importContent)}
                                        disabled={!importContent}
                                        className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm disabled:opacity-50"
                                    >
                                        Parse Content
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                                    onClick={() => setIsImportModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input
                            type="checkbox"
                            name="playgroundEnabled"
                            id="playgroundEnabled"
                            checked={formData.playgroundEnabled}
                            onChange={(e) => setFormData({ ...formData, playgroundEnabled: e.target.checked })}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            style={{
                                right: formData.playgroundEnabled ? '0' : 'auto',
                                left: formData.playgroundEnabled ? 'auto' : '0',
                                borderColor: formData.playgroundEnabled ? '#4f46e5' : '#d1d5db'
                            }}
                        />
                        <label
                            htmlFor="playgroundEnabled"
                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.playgroundEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        ></label>
                    </div>
                    <div>
                        <label htmlFor="playgroundEnabled" className="font-medium text-gray-900 cursor-pointer">Enable API Playground</label>
                        <p className="text-xs text-gray-500">Allow users to test endpoints directly. Disable if you want to restrict access.</p>
                    </div>
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
