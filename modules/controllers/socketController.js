module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
  
      socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
      });
  
      socket.on('startTyping', ({ receiverId }) => {
        io.to(receiverId).emit('typing');
      });
  
      socket.on('stopTyping', ({ receiverId }) => {
        io.to(receiverId).emit('stopTyping');
      });
  
      socket.on('markAsSeen', ({ messageIds, senderId }) => {
        messageIds.forEach((messageId) => {
          io.to(senderId).emit('messageSeen', { _id: messageId, seen: true, seenAt: new Date() });
        });
      });
  
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  };
  