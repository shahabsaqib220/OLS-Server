const express = require('express');
const app = express();
const mongoose = require("mongoose");
const http = require('http');
const { Server } = require('socket.io');
const socketIo = require('socket.io')



const cors = require("cors");
require('dotenv').config()
const bodyParser = require('body-parser');
const userregisteration = require('./modules/user-registration/main-router');
const userlogin = require("./modules/user-login/main-router")
const userads = require('./modules/user-ads/main-router')
const connectDB = require('./db');
const user_updated_ad = require("./modules/user-existing-edited-ad/main-router")
const adsdetails = require("./modules/details-of-product/main-router")
const securityOptions = require("./modules/user-change-password/main-router")
const filteredAds = require("./modules/user-filtered-ads-and-cart-item/main-router")
const userChatsRouter = require("./modules/users-chats/user-chats-router")


// Production Level API: "https://buy-sell-product-client.vercel.app"


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: 'https://buy-sell-product-client.vercel.app', // Replace with your production client's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the methods you need
    credentials: true, // If using cookies or authentication headers
  })
);



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
      origin: "https://buy-sell-product-client.vercel.app", // Adjust to your frontend URL
      methods: ["GET", "POST","PUT"],
  },
});

app.get("/", (req, res) => {
  res.send("Hello from Express");
});



app.use((req, res, next) => {
  req.io = io;
  next();
});
















app.use('/api/auth', userregisteration)
app.use('/api/userlogin', userlogin )
app.use('/api/user-ads',userads  )
app.use('/api/product/details',adsdetails  )
app.use('/api/updated/user', user_updated_ad)
app.use('/api/security/options', securityOptions)
app.use('/api/filtering', filteredAds)

app.use('/api/users-chats',userChatsRouter )


io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user to a room based on user ID
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });




  

  // Typing indicators
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
      // Emit the messageSeen event to the sender
      io.to(senderId).emit('messageSeen', { _id: messageId, seen: true, seenAt: new Date() });
    });
  });



  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});












const PORT =5000;










server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

