import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Send, Users, MessageCircle, MoreVertical } from 'lucide-react';
import axios from 'axios';

const ENDPOINT = import.meta.env.VITE_API_URL || 'https://apihub-qmpv.onrender.com';

const ChatRoom = ({ community, goBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io(ENDPOINT);
        setSocket(newSocket);

        // Join room
        newSocket.emit('join_community', community._id);

        // Listen for messages
        newSocket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        // Load history
        fetchMessages();

        return () => newSocket.close();
    }, [community._id]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`api/communities/${community._id}/messages`, config);
            setMessages(data);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to load messages', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            communityId: community._id,
            senderId: user.id,
            content: newMessage,
            senderName: user.username // Optimistic update support if needed
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLeaveCommunity = async () => {
        if (!window.confirm('Are you sure you want to leave this community?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Using existing join endpoint to toggle off? Or new endpoint needed.
            // For now, assuming user wants to just exit the view. 
            // Ideally we'd remove them from members array in backend too.
            // Let's just go back for now as "Leave" implies exiting the room.
            goBack();
        } catch (error) {
            console.error('Error leaving community', error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={goBack} className="md:hidden text-gray-500 hover:text-gray-700">
                        &larr; Back
                    </button>
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                        {community.icon}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">{community.name}</h2>
                        <p className="text-xs text-gray-500">{community.members.length} members</p>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                            <button
                                onClick={handleLeaveCommunity}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Leave Group
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => {
                    const isMe = msg.sender?._id === user.id || msg.sender === user.id;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 border border-white shadow-sm">
                                    {(msg.sender?.username || 'User')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className={`p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                        <p>{msg.content}</p>
                                    </div>
                                    <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {msg.sender?.username} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatRoom;
