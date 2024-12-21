const express = require('express');
const app = express();
const mongoose = require("mongoose");
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
require('dotenv').config();
const bodyParser = require('body-parser');

// Import routes
const userregisteration = require('./modules/user-registration/main-router');
const userlogin = require("./modules/user-login/main-router");
const userads = require('./modules/user-ads/main-router');
const connectDB = require('./db');
const user_updated_ad = require("./modules/user-existing-edited-ad/main-router");
const adsdetails = require("./modules/details-of-product/main-router");
const securityOptions = require("./modules/user-change-password/main-router");
const filteredAds = require("./modules/user-filtered-ads-and-cart-item/main-router");
const userChatsRouter = require("./modules/users-chats/user-chats-router");

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your production client's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the methods you need
    credentials: true, // If using cookies or authentication headers
  })
);

// Routes
app.use('/api/auth', userregisteration);
app.use('/api/userlogin', userlogin);
app.use('/api/user-ads', userads);
app.use('/api/product/details', adsdetails);
app.use('/api/updated/user', user_updated_ad);
app.use('/api/security/options', securityOptions);
app.use('/api/filtering', filteredAds);
app.use('/api/users-chats', userChatsRouter);

// Health check route
app.get("/", (req, res) => {
  res.send("Hello from Express");
});

// Fontend route "https://buy-sell-product-client.vercel.app"

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:"http://localhost:3000" ,
    methods: ["GET", "POST"]
  }
});

// Attach Socket.IO instance to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on('startTyping', (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit('typing', data);
  });

  socket.on('stopTyping', (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit('stopTyping', data);
  });

  socket.on('markAsSeen', (data) => {
    const { messageIds, senderId } = data; // Ensure you send senderId with the messageIds
    messageIds.forEach((messageId) => {
      io.to(senderId).emit('messageSeen', { _id: messageId, seen: true, seenAt: new Date() });
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export and Run Server
module.exports = app; // Export app for serverless environments

const PORT = 5000; // Use your desired port for local development
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
