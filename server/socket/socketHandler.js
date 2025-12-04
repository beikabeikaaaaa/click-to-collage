/**
 * Socket.io event handler
 */

// Store connected users
const users = new Map();

// Store user operations for broadcasting
const userOperations = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with nickname and color
    socket.on('user-join', (userData) => {
      const user = {
        id: socket.id,
        nickname: userData.nickname || `User-${socket.id.substring(0, 6)}`,
        color: userData.color || '#3498db',
        joinedAt: new Date()
      };

      users.set(socket.id, user);
      userOperations.set(socket.id, []);

      // Notify the user of their own connection
      socket.emit('user-joined', {
        userId: socket.id,
        nickname: user.nickname,
        color: user.color
      });

      // Broadcast to other users
      socket.broadcast.emit('user-joined', {
        userId: socket.id,
        nickname: user.nickname,
        color: user.color
      });

      // Send list of existing users to the new user
      const existingUsers = Array.from(users.values()).map(u => ({
        userId: u.id,
        nickname: u.nickname,
        color: u.color
      }));
      socket.emit('existing-users', existingUsers);

      console.log(`User ${user.nickname} (${socket.id}) joined`);
    });

    // User adds a material to their canvas
    socket.on('add-material', (data) => {
      const user = users.get(socket.id);
      if (!user) return;

      const operation = {
        type: 'add-material',
        userId: socket.id,
        nickname: user.nickname,
        color: user.color,
        materialId: data.materialId,
        materialUrl: data.materialUrl,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        timestamp: Date.now()
      };

      // Store operation
      const operations = userOperations.get(socket.id) || [];
      operations.push(operation);
      userOperations.set(socket.id, operations);

      // Broadcast to other users (they see it as a ghost/preview)
      socket.broadcast.emit('user-operation', operation);
    });

    // User moves a material
    socket.on('move-material', (data) => {
      const user = users.get(socket.id);
      if (!user) return;

      const operation = {
        type: 'move-material',
        userId: socket.id,
        nickname: user.nickname,
        color: user.color,
        materialId: data.materialId,
        x: data.x,
        y: data.y,
        timestamp: Date.now()
      };

      // Broadcast to other users
      socket.broadcast.emit('user-operation', operation);
    });

    // User resizes a material
    socket.on('resize-material', (data) => {
      const user = users.get(socket.id);
      if (!user) return;

      const operation = {
        type: 'resize-material',
        userId: socket.id,
        nickname: user.nickname,
        color: user.color,
        materialId: data.materialId,
        width: data.width,
        height: data.height,
        timestamp: Date.now()
      };

      // Broadcast to other users
      socket.broadcast.emit('user-operation', operation);
    });

    // User deletes a material
    socket.on('delete-material', (data) => {
      const user = users.get(socket.id);
      if (!user) return;

      const operation = {
        type: 'delete-material',
        userId: socket.id,
        nickname: user.nickname,
        color: user.color,
        materialId: data.materialId,
        timestamp: Date.now()
      };

      // Broadcast to other users
      socket.broadcast.emit('user-operation', operation);
    });

    // User updates their canvas background
    socket.on('background-changed', (data) => {
      const user = users.get(socket.id);
      if (!user) return;

      const operation = {
        type: 'background-changed',
        userId: socket.id,
        nickname: user.nickname,
        color: user.color,
        backgroundUrl: data.backgroundUrl,
        timestamp: Date.now()
      };

      // Broadcast to other users
      socket.broadcast.emit('user-operation', operation);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (user) {
        console.log(`User ${user.nickname} (${socket.id}) disconnected`);

        // Broadcast user left
        socket.broadcast.emit('user-left', {
          userId: socket.id
        });

        // Clean up
        users.delete(socket.id);
        userOperations.delete(socket.id);
      }
    });
  });

  console.log('Socket.io handler initialized');
};

