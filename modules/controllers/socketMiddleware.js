// modules/controllers/socketMiddleware.js
const attachIO = (app, io) => {
  app.use((req, res, next) => {
    req.io = io; // Attach the Socket.IO instance to the request object
    next();
  });
};

module.exports = attachIO;