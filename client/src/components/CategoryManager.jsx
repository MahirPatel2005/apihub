import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Layers, Edit2, Trash2, Plus, Ban, CheckCircle } from 'lucide-react';

const CategoryManager = () => {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'tags'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItemName, setNewItemName] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');

    // Merge State
    const [mergeOriginal, setMergeOriginal] = useState('');
    const [mergeTarget, setMergeTarget] = useState('');

    const handleMerge = async () => {
        if (!window.confirm(`Merge "${mergeOriginal}" into "${mergeTarget}"? This cannot be undone.`)) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/content/admin/tags/merge', {
                originalTag: mergeOriginal,
                targetTag: mergeTarget
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMergeOriginal('');
            setMergeTarget('');
            alert('Tags merged successfully!');
            fetchItems();
        } catch (error) {
            console.error('Error merging tags', error);
            alert('Failed to merge tags');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'tags' ? '/api/content/admin/tags' : '/api/content/admin/categories';
            const res = await axios.get(`http://localhost:5001${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(res.data);
        } catch (error) {
            console.error('Error fetching items', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'categories' ? '/api/content/admin/categories' : '/api/content/admin/tags'; // Tags create might not be explicit if dynamic but let's assume specific or auto-created
            // Note: Tag creation is usually implicit, but admins might want to pre-seed. 
            // My backend controller (`categoryController`) only implemented `createCategory` explicitly? 
            // Wait, checking my controller code... `createCategory` exists. `createTag` does NOT exist in the controller I wrote.
            // I should handle tag creation probably or just focus on categories. 
            // For now, I'll limit creation to Categories as Tags are usually user-generated.

            if (activeTab === 'tags') return; // Disable tag creation for now

            await axios.post(`http://localhost:5001${endpoint}`, {
                name: newItemName,
                description: newItemDesc
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewItemName('');
            setNewItemDesc('');
            fetchItems();
        } catch (error) {
            console.error('Error creating item', error);
        }
    };

    const handleToggleBlock = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'categories' ? `/api/content/admin/categories/${id}` : `/api/content/admin/tags/${id}`;

            await axios.put(`http://localhost:5001${endpoint}`, {
                isBlocked: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setItems(items.map(item => item._id === id ? { ...item, isBlocked: !currentStatus } : item));
        } catch (error) {
            console.error('Error updating item', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item? This cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'categories' ? `/api/content/admin/categories/${id}` : `/api/content/admin/tags/${id}`;
            await axios.delete(`http://localhost:5001${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(items.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error deleting item', error);
        }
    };

    // Category Merge State
    const [mergeCategoryOriginal, setMergeCategoryOriginal] = useState('');
    const [mergeCategoryTarget, setMergeCategoryTarget] = useState('');

    const handleMergeCategories = async () => {
        const originalName = items.find(i => i._id === mergeCategoryOriginal)?.name;
        const targetName = items.find(i => i._id === mergeCategoryTarget)?.name;

        if (!window.confirm(`Merge category "${originalName}" into "${targetName}"? This cannot be undone and "${originalName}" will be deleted.`)) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/content/admin/categories/merge', {
                originalCategoryId: mergeCategoryOriginal,
                targetCategoryId: mergeCategoryTarget
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMergeCategoryOriginal('');
            setMergeCategoryTarget('');
            alert('Categories merged successfully!');
            fetchItems();
        } catch (error) {
            console.error('Error merging categories', error);
            alert('Failed to merge categories');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                    Taxonomy Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manage categories and tags to organize platform content.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'categories'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Layers size={16} /> Categories
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('tags')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'tags'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Tag size={16} /> Tags
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('tools')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'tools'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Edit2 size={16} /> Utilities
                    </div>
                </button>
            </div>

            {/* Create Form (Categories only) */}
            {activeTab === 'categories' && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Add New Category</h3>
                    <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Category Name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Description (Optional)"
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-1/2 p-2.5"
                        />
                        <button
                            type="submit"
                            className="text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <Plus size={16} /> Create
                        </button>
                    </form>
                </div>
            )}

            {/* Utilities / Tools Tab */}
            {activeTab === 'tools' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Merge Tags */}
                    <div className="bg-white p-6 rounded-xl border border-indigo-100 bg-indigo-50/30">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Tag size={16} className="text-indigo-600" /> Merge Duplicate Tags
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Original Tag (removed)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ai-tools"
                                    value={mergeOriginal}
                                    onChange={(e) => setMergeOriginal(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Target Tag (kept)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. artificial-intelligence"
                                    value={mergeTarget}
                                    onChange={(e) => setMergeTarget(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                />
                            </div>
                            <button
                                onClick={handleMerge}
                                disabled={!mergeOriginal || !mergeTarget || loading}
                                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md disabled:opacity-50"
                            >
                                Merge Tags
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                Updates all APIs using respective tags globally.
                            </p>
                        </div>
                    </div>

                    {/* Merge Categories */}
                    <div className="bg-white p-6 rounded-xl border border-blue-100 bg-blue-50/30">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Layers size={16} className="text-blue-600" /> Merge Categories
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Original Category (deleted)</label>
                                <select
                                    value={mergeCategoryOriginal}
                                    onChange={(e) => setMergeCategoryOriginal(e.target.value)}
                                    onClick={() => { if (items.length === 0) fetchItems() }} // Lazy load if needed, but handled by effect usually
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    <option value="">Select Category</option>
                                    {items.filter(i => i._id !== mergeCategoryTarget).map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Target Category (kept)</label>
                                <select
                                    value={mergeCategoryTarget}
                                    onChange={(e) => setMergeCategoryTarget(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    <option value="">Select Category</option>
                                    {items.filter(i => i._id !== mergeCategoryOriginal).map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleMergeCategories}
                                disabled={!mergeCategoryOriginal || !mergeCategoryTarget || loading}
                                className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md disabled:opacity-50"
                            >
                                Merge Categories
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                Reassigns APIs and deletes the original category.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* List (Only for Categories or Tags tabs) */}
            {activeTab !== 'tools' && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage Count</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-12 text-gray-400 animate-pulse">Loading items...</td></tr>
                                ) : items.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-12 text-gray-500 font-medium">No {activeTab} found.</td></tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.count || 0} APIs
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleBlock(item._id, item.isBlocked)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.isBlocked
                                                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        } transition-colors cursor-pointer`}
                                                >
                                                    {item.isBlocked ? (
                                                        <><Ban size={12} className="mr-1" /> Blocked</>
                                                    ) : (
                                                        <><CheckCircle size={12} className="mr-1" /> Active</>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;
