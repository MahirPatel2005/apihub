import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Clock, Code, Database, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';

const ApiPlayground = ({ api, prefillEndpoint }) => {
    const [method, setMethod] = useState('GET');
    const [baseUrl, setBaseUrl] = useState('');
    const [path, setPath] = useState('');
    const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
    const [body, setBody] = useState('{}');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('params'); // params, headers, body

    // Params State
    const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
    const [pathParams, setPathParams] = useState({});

    // Initialize from props
    useEffect(() => {
        if (prefillEndpoint) {
            setMethod(prefillEndpoint.method);
            setBaseUrl(api.baseUrl);
            setPath(prefillEndpoint.path);

            // Extract path params from prefillEndpoint.path (e.g. /users/{id})
            const matches = prefillEndpoint.path.match(/\{([^}]+)\}/g);
            if (matches) {
                const initialPathParams = {};
                matches.forEach(m => {
                    const key = m.replace(/[{}]/g, '');
                    initialPathParams[key] = '';
                });
                setPathParams(initialPathParams);
            }
            // Reset query params
            setQueryParams([{ key: '', value: '' }]);
        } else if (api) {
            setBaseUrl(api.baseUrl);
            if (api.endpoints && api.endpoints.length > 0) {
                // Find a GET endpoint if possible
                const getEndpoint = api.endpoints.find(e => e.method === 'GET');
                const target = getEndpoint || api.endpoints[0];
                setMethod(target.method);
                setPath(target.path);

                // Path Params extraction
                const matches = target.path.match(/\{([^}]+)\}/g);
                if (matches) {
                    const initialPathParams = {};
                    matches.forEach(m => {
                        const key = m.replace(/[{}]/g, '');
                        initialPathParams[key] = '';
                    });
                    setPathParams(initialPathParams);
                }
            }
        }
    }, [api, prefillEndpoint]);

    // Construct full URL
    const fullUrl = (() => {
        if (!baseUrl) return '';

        let constructedPath = path;
        // Replace path params
        Object.keys(pathParams).forEach(key => {
            if (pathParams[key]) {
                constructedPath = constructedPath.replace(`{${key}}`, pathParams[key]);
            }
        });

        try {
            const urlObj = new URL(`${baseUrl}${constructedPath}`);

            // Append query params
            queryParams.forEach(p => {
                if (p.key) urlObj.searchParams.append(p.key, p.value);
            });

            return urlObj.toString();
        } catch (e) {
            return `${baseUrl}${constructedPath}`;
        }
    })();

    const handleSend = async () => {
        setLoading(true);
        setResponse(null);

        try {
            let parsedHeaders = {};
            try {
                parsedHeaders = JSON.parse(headers);
            } catch (e) {
                alert('Invalid JSON in Headers');
                setLoading(false);
                return;
            }

            let parsedBody = {};
            if (method !== 'GET') {
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    alert('Invalid JSON in Body');
                    setLoading(false);
                    return;
                }
            }

            const res = await axios.post('/api/proxy', {
                method,
                url: fullUrl,
                headers: parsedHeaders,
                body: method !== 'GET' ? parsedBody : undefined
            });

            setResponse(res.data);
        } catch (error) {
            if (error.response && error.response.data) {
                setResponse(error.response.data);
            } else {
                setResponse({
                    status: 0,
                    statusText: 'Network Error',
                    data: { message: error.message },
                    duration: 0
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return 'text-green-600 bg-green-50 border-green-200';
        if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    // Helper to add query param row
    const addQueryParam = () => setQueryParams([...queryParams, { key: '', value: '' }]);

    // Helper to remove query param row
    const removeQueryParam = (index) => {
        const newParams = [...queryParams];
        newParams.splice(index, 1);
        setQueryParams(newParams);
    };

    // Helper to update query param
    const updateQueryParam = (index, field, value) => {
        const newParams = [...queryParams];
        newParams[index][field] = value;
        setQueryParams(newParams);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary-600" />
                    API Playground
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded">Live Test</span>
            </div>

            <div className="p-6">
                {/* Request Builder */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="w-full md:w-32 flex-shrink-0">
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 font-mono font-bold"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={fullUrl}
                            readOnly
                            className="w-full rounded-lg border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-primary-500 font-mono text-sm text-gray-600 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-all shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg'}`}
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Play className="h-4 w-4 fill-current" />
                            )}
                            Send
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex border-b border-gray-200 mb-4">
                        {['params', 'headers', 'body'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'headers' && (
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Request Headers (JSON)</label>
                            <textarea
                                value={headers}
                                onChange={(e) => setHeaders(e.target.value)}
                                className="w-full h-32 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 font-mono text-xs bg-gray-50"
                            />
                        </div>
                    )}

                    {activeTab === 'body' && (
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Request Body (JSON)</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                disabled={method === 'GET'}
                                className={`w-full h-32 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 font-mono text-xs bg-gray-50 ${method === 'GET' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            {method === 'GET' && <p className="text-xs text-gray-400 mt-1">Body is not available for GET requests.</p>}
                        </div>
                    )}

                    {activeTab === 'params' && (
                        <div className="space-y-6">
                            {/* Path Params Section */}
                            {Object.keys(pathParams).length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Path Variables</h4>
                                    <div className="grid gap-3">
                                        {Object.keys(pathParams).map(key => (
                                            <div key={key} className="flex items-center gap-3">
                                                <div className="w-32 flex-shrink-0">
                                                    <span className="inline-block px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-mono border border-indigo-100 w-full">
                                                        {`{${key}}`}
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={`Value for ${key}`}
                                                    value={pathParams[key]}
                                                    onChange={(e) => setPathParams({ ...pathParams, [key]: e.target.value })}
                                                    className="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Query Params Section */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Query Parameters</h4>
                                <div className="space-y-3">
                                    {queryParams.map((param, index) => (
                                        <div key={index} className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="Key"
                                                value={param.key}
                                                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                                                className="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={param.value}
                                                onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                                                className="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            />
                                            <button
                                                onClick={() => removeQueryParam(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                disabled={queryParams.length === 1 && !queryParams[0].key}
                                            >
                                                <Smartphone className="h-4 w-4 rotate-45" /> {/* Using generic icon as trash or x */}
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addQueryParam}
                                        className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
                                    >
                                        <Play className="h-3 w-3 rotate-90" /> Add Parameter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Response Area */}
                {response && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-900">Response</h4>
                            <div className="flex gap-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getStatusColor(response.status)}`}>
                                    {response.status} {response.statusText}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                    <Clock className="h-3 w-3" />
                                    {response.duration}ms
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                    <Database className="h-3 w-3" />
                                    {response.size || 0}B
                                </span>
                            </div>
                        </div>
                        <div className="relative">
                            <pre className="w-full max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400 font-mono custom-scrollbar">
                                {JSON.stringify(response.data, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiPlayground;
