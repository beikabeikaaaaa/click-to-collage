/**
 * Socket.io Client - Handles real-time communication with server
 */

class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.userId = null;
    this.nickname = null;
    this.color = null;
    this.otherUsers = new Map(); // Store other users' operations
  }

  /**
   * Connect to socket server with user info
   */
  connect(nickname, color) {
    if (this.socket && this.socket.connected) {
      console.log('Already connected');
      return;
    }

    this.socket = io();
    this.nickname = nickname;
    this.color = color;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
      this.userId = this.socket.id;
      
      // Update connection status
      const statusEl = document.getElementById('connection-status');
      if (statusEl) {
        statusEl.textContent = '已连接';
        statusEl.className = 'status-indicator connected';
      }

      // Join with user info
      this.socket.emit('user-join', {
        nickname: nickname,
        color: color
      });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
      
      const statusEl = document.getElementById('connection-status');
      if (statusEl) {
        statusEl.textContent = '未连接';
        statusEl.className = 'status-indicator';
      }
    });

    // User events
    this.socket.on('user-joined', (userData) => {
      console.log('User joined:', userData);
      this.updateOnlineUsers();
    });

    this.socket.on('user-left', (userData) => {
      console.log('User left:', userData);
      // Remove user's ghost materials
      if (window.collageManager) {
        const materials = window.collageManager.getMaterials();
        const userMaterials = materials.filter(m => m.userId === userData.userId);
        userMaterials.forEach(m => {
          window.collageManager.deleteMaterial(m.id);
        });
      }
      this.updateOnlineUsers();
    });

    this.socket.on('existing-users', (users) => {
      console.log('Existing users:', users);
      this.updateOnlineUsers();
    });

    // Operation events
    this.socket.on('user-operation', (operation) => {
      this.handleUserOperation(operation);
    });
  }

  /**
   * Handle user operation from socket
   */
  handleUserOperation(operation) {
    if (!window.collageManager) return;

    switch (operation.type) {
      case 'add-material':
        // Add material as ghost (semi-transparent)
        window.collageManager.addExternalMaterial({
          materialId: `ghost-${operation.userId}-${operation.materialId}`,
          materialUrl: operation.materialUrl,
          x: operation.x,
          y: operation.y,
          width: operation.width,
          height: operation.height,
          userId: operation.userId,
          color: operation.color,
          nickname: operation.nickname
        }, true).then(material => {
          // Material is already rendered in addExternalMaterial
        });
        break;

      case 'move-material':
        // Update ghost material position
        const ghostId = `ghost-${operation.userId}-${operation.materialId}`;
        window.collageManager.updateMaterialPosition(ghostId, operation.x, operation.y);
        break;

      case 'resize-material':
        // Update ghost material size
        const resizeGhostId = `ghost-${operation.userId}-${operation.materialId}`;
        const resizeMaterial = window.collageManager.getMaterials().find(m => m.id === resizeGhostId);
        if (resizeMaterial) {
          resizeMaterial.width = operation.width;
          resizeMaterial.height = operation.height;
          window.collageManager.render();
        }
        break;

      case 'delete-material':
        // Remove ghost material
        const deleteGhostId = `ghost-${operation.userId}-${operation.materialId}`;
        window.collageManager.deleteMaterial(deleteGhostId);
        break;

      case 'background-changed':
        // Show notification that user changed background
        console.log(`${operation.nickname} changed background`);
        break;
    }
  }

  /**
   * Render ghost material with transparency and user indicator
   * Note: This is now handled in CollageManager.render()
   */
  renderGhostMaterial(material) {
    // Re-render canvas to show ghost material
    if (window.collageManager) {
      window.collageManager.render();
    }
  }

  /**
   * Update online users list
   */
  updateOnlineUsers() {
    const onlineUsersEl = document.getElementById('online-users');
    if (!onlineUsersEl) return;
    
    // Request user list from server (we'll track locally for now)
    if (this.socket && this.socket.connected) {
      // The server should send existing-users on connection
      // For now, we show a simple message
      onlineUsersEl.innerHTML = '<div class="empty">其他用户的操作会显示在画布上</div>';
    } else {
      onlineUsersEl.innerHTML = '<div class="empty">未连接</div>';
    }
  }

  /**
   * Emit add material event
   */
  emitAddMaterial(material) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('add-material', {
      materialId: material.id,
      materialUrl: material.url,
      x: material.x,
      y: material.y,
      width: material.width,
      height: material.height
    });
  }

  /**
   * Emit move material event
   */
  emitMoveMaterial(material) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('move-material', {
      materialId: material.id,
      x: material.x,
      y: material.y
    });
  }

  /**
   * Emit resize material event
   */
  emitResizeMaterial(material) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('resize-material', {
      materialId: material.id,
      width: material.width,
      height: material.height
    });
  }

  /**
   * Emit delete material event
   */
  emitDeleteMaterial(materialId) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('delete-material', {
      materialId: materialId
    });
  }

  /**
   * Emit background changed event
   */
  emitBackgroundChanged(backgroundUrl) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('background-changed', {
      backgroundUrl: backgroundUrl
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

// Initialize socket client
window.socketClient = new SocketClient();

