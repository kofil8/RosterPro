import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9001';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    // If already connected with same token, return existing socket
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    // Disconnect existing socket if token changed
    if (this.socket && this.token !== token) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.token = token;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // Send private message
  sendPrivateMessage(receiverId: string, content: string) {
    this.socket?.emit('private-message', {
      receiverId,
      content,
    });
  }

  // Send room message
  sendRoomMessage(content: string, roomId?: string) {
    this.socket?.emit('room-message', {
      content,
      roomId,
    });
  }

  // Send typing indicator
  sendTyping(receiverId?: string, roomId?: string, isTyping: boolean = true) {
    this.socket?.emit('typing', {
      receiverId,
      roomId,
      isTyping,
    });
  }

  // Mark message as read
  markMessageRead(messageId: string) {
    this.socket?.emit('mark-read', { messageId });
  }

  // Join room
  joinRoom(roomId: string) {
    this.socket?.emit('join-room', { roomId });
  }

  // Leave room
  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', { roomId });
  }

  // Update status
  updateStatus(status: 'online' | 'away' | 'busy') {
    this.socket?.emit('update-status', { status });
  }

  // Get unread count
  getUnreadCount() {
    this.socket?.emit('get-unread-count');
  }

  // Event listeners
  onPrivateMessage(callback: (message: any) => void) {
    this.socket?.on('private-message', callback);
  }

  onRoomMessage(callback: (message: any) => void) {
    this.socket?.on('room-message', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user-typing', callback);
  }

  onUserStatus(callback: (data: any) => void) {
    this.socket?.on('user-status', callback);
  }

  onMessageRead(callback: (data: any) => void) {
    this.socket?.on('message-read', callback);
  }

  onUnreadCount(callback: (data: any) => void) {
    this.socket?.on('unread-count', callback);
  }

  // Remove event listeners
  offPrivateMessage(callback: (message: any) => void) {
    this.socket?.off('private-message', callback);
  }

  offRoomMessage(callback: (message: any) => void) {
    this.socket?.off('room-message', callback);
  }

  offUserTyping(callback: (data: any) => void) {
    this.socket?.off('user-typing', callback);
  }

  offUserStatus(callback: (data: any) => void) {
    this.socket?.off('user-status', callback);
  }

  offMessageRead(callback: (data: any) => void) {
    this.socket?.off('message-read', callback);
  }

  offUnreadCount(callback: (data: any) => void) {
    this.socket?.off('unread-count', callback);
  }
}

const socketClient = new SocketClient();
export default socketClient;

