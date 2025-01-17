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
const attachIO = require('./modules/controllers/socketMiddleware'); // Middleware to attach Socket.IO
const initializeSockets = require('./modules/controllers/socketController'); 
const userSellFastRouter = require("./modules/users-sell-fast-ads/router")

// Connect to MongoDB
connectDB();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:"https://buy-sell-product-client.vercel.app",
    methods: ["GET", "POST", "PUT"],
  },
  transports: ["websocket", "polling"], // Enable WebSocket for better performance
});

// Attach Socket.IO instance to req object
attachIO(app, io);
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// https://buy-sell-product-client.vercel.app

// Local API : "http://localhost:3000"


app.use(
  cors({
    origin: "https://buy-sell-product-client.vercel.app", // Replace with your production client's URL
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
app.use('/api/users-fast', userSellFastRouter);

// Health check route
app.get("/", (req, res) => {
  res.send("Hello from Express");
});

// Fontend route "https://buy-sell-product-client.vercel.app"





// Initialize Socket.IO logic
initializeSockets(io);

// Export and Run Server
module.exports = app; // Export app for serverless environments

const PORT = 5000; // Use your desired port for local development
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
