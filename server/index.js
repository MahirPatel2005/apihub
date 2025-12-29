require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Limit each IP to 2000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter); // Apply to all API routes

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

// Maintenance Mode Middleware
const checkMaintenanceMode = require('./middleware/checkMaintenanceMode');
app.use(checkMaintenanceMode);

// Routes
app.use('/api/apis', require('./routes/apiRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/content', require('./routes/categoryRoutes'));
app.use('/api/proxy', require('./routes/proxyRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'OK', uptime: process.uptime() }));

const { getSitemap } = require('./controllers/sitemapController');
app.get('/sitemap.xml', getSitemap);

app.get('/', (req, res) => {
    res.send('API Hub Backend is running');
});

const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            process.env.CLIENT_URL
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
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

// Cron Jobs
const { initCronJobs } = require('./utils/backupService');
initCronJobs();

// Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
