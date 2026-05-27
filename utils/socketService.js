let socketIo;
try {
  socketIo = require('socket.io');
} catch (e) {
  socketIo = null;
}

let ioInstance = null;

/**
 * Initializes the Socket.io instance and binds it to the Node HTTP server listener.
 * @param {object} server Node HTTP Server object
 */
const initSocket = (server) => {
  if (!socketIo) {
    console.log('[SOCKET WARNING] socket.io package is not installed. Real-time updates will run in diagnostic console mode.');
    return null;
  }

  ioInstance = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[SOCKET SUCCESS] Client connected. Socket ID: ${socket.id}`);

    // Allow socket to register as an admin client
    socket.on('register_admin', () => {
      socket.join('admins');
      console.log(`[SOCKET] Socket ${socket.id} joined 'admins' room.`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected. Socket ID: ${socket.id}`);
    });
  });

  return ioInstance;
};

/**
 * Broadcasts an event to all connected admin sockets.
 * @param {string} event Event tag (e.g. 'new_order', 'low_stock')
 * @param {object} data Payload JSON context
 */
const broadcastToAdmins = (event, data) => {
  if (ioInstance) {
    // Emit to room 'admins' as well as general stream
    ioInstance.to('admins').emit(event, data);
    ioInstance.emit(event, data); // fallback general broadcast
    console.log(`[SOCKET BROADCAST] Emitted real-time ${event} alert to active admin sessions.`);
  } else {
    console.log(`[SANDBOX SOCKET] MOCK BROADCAST: ${event} -> ${JSON.stringify(data)}`);
  }
};

module.exports = {
  initSocket,
  broadcastToAdmins
};
