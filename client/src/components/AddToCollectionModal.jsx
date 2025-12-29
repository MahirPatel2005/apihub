import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Folder, Plus } from 'lucide-react';

const AddToCollectionModal = ({ isOpen, onClose, apiId }) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // id of collection being added to
    const [newCollectionName, setNewCollectionName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCollections();
        }
    }, [isOpen]);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/collections', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(res.data);
        } catch (error) {
            console.error('Error fetching collections', error);
        }
        setLoading(false);
    };

    const handleAddToCollection = async (collectionId) => {
        setActionLoading(collectionId);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/collections/${collectionId}/add`, { apiId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Show success? Or just close?
            // Let's toggle standard visual feedback
            // For now, assuming success updates button state or we close modal
            onClose();
            alert('Added to collection!');
        } catch (error) {
            console.error('Error adding to collection', error);
            if (error.response?.data?.message === 'API already in collection') {
                alert('Already in this collection!');
            }
        }
        setActionLoading(null);
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/collections', {
                name: newCollectionName,
                isPublic: false
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Add to new collection immediately
            await axios.post(`/api/collections/${res.data._id}/add`, { apiId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCollections([res.data, ...collections]);
            setNewCollectionName('');
            onClose();
            alert('Collection created and API added!');
        } catch (error) {
            console.error('Error creating collection', error);
        }
        setCreating(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                        <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}>
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start mb-4">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                            <Folder className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Save to Collection</h3>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {collections.map(col => (
                                <button
                                    key={col._id}
                                    onClick={() => handleAddToCollection(col._id)}
                                    disabled={actionLoading === col._id}
                                    className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-50 border border-gray-100 flex items-center justify-between group"
                                >
                                    <span className="font-medium text-gray-700 group-hover:text-indigo-600">{col.name}</span>
                                    {col.apis?.includes(apiId) ? (
                                        <span className="text-xs text-green-600 font-bold">Saved</span>
                                    ) : (
                                        <Plus className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
                                    )}
                                </button>
                            ))}
                            {collections.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-2">No collections found.</p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleCreateCollection} className="mt-4 pt-4 border-t border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-2">Create New Collection</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Collection Name"
                            />
                            <button
                                type="submit"
                                disabled={creating || !newCollectionName.trim()}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {creating ? '...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;
