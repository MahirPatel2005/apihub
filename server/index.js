require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/api-hub');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/apis', require('./routes/apiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/proxy', require('./routes/proxyRoutes'));
app.use('/api/communities', require('./routes/communityRoutes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'OK', uptime: process.uptime() }));

app.get('/', (req, res) => {
    res.send('API Hub Backend is running');
});

const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"], // Support both standard and backup ports
        methods: ["GET", "POST"]
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_community', (communityId) => {
        socket.join(communityId);
        console.log(`User ${socket.id} joined community: ${communityId}`);
    });

    socket.on('send_message', async (data) => {
        // data: { communityId, senderId, content, senderName } (senderName for optimistic UI)
        try {
            // Save to DB
            const newMessage = await Message.create({
                community: data.communityId,
                sender: data.senderId,
                content: data.content
            });

            // Populate sender info before broadcasting
            const populatedMessage = await newMessage.populate('sender', 'username avatar');

            // Broadcast to room
            io.to(data.communityId).emit('receive_message', populatedMessage);
        } catch (error) {
            console.error('Socket Message Error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
