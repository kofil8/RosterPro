import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import prisma from '../config/database';
import { verifyAccessToken } from '../services/jwt.service';
import { setUserOnlineStatus } from '../services/notification.service';
import { JWTPayload, SocketAuthPayload, SocketMessagePayload, SocketTypingPayload } from '../types';
import { MessageType } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  user?: JWTPayload;
}

/**
 * Initialize Socket.IO server
 */
export const initializeSocketServer = (httpServer: HTTPServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);

      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.user?.email} (${socket.id})`);

    const userId = socket.user?.id;

    if (!userId) {
      socket.disconnect();
      return;
    }

    // Set user online status
    await setUserOnlineStatus(userId, true);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Join user to their company room if they have one
    if (socket.user?.companyId) {
      socket.join(`company:${socket.user.companyId}`);
    }

    // Broadcast user online status
    io.emit('user-status', {
      userId,
      status: 'online',
    });

    /**
     * Send private message
     */
    socket.on('private-message', async (data: SocketMessagePayload) => {
      try {
        if (!socket.user) return;

        const { content, receiverId } = data;

        if (!receiverId || !content) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Verify receiver exists and belongs to same company
        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
        });

        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        if (receiver.companyId !== socket.user.companyId) {
          socket.emit('error', { message: 'Cannot send message to user from different company' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content,
            type: MessageType.PRIVATE,
            senderId: socket.user.id,
            receiverId,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            receiver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });

        // Send message to receiver
        io.to(`user:${receiverId}`).emit('private-message', message);

        // Send confirmation to sender
        socket.emit('private-message', message);
      } catch (error) {
        console.error('Private message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Send room message (company-wide)
     */
    socket.on('room-message', async (data: SocketMessagePayload) => {
      try {
        if (!socket.user || !socket.user.companyId) return;

        const { content, roomId } = data;

        if (!content) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        const finalRoomId = roomId || `company:${socket.user.companyId}`;

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content,
            type: MessageType.ROOM,
            senderId: socket.user.id,
            roomId: finalRoomId,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });

        // Broadcast message to room
        io.to(finalRoomId).emit('room-message', message);
      } catch (error) {
        console.error('Room message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (data: SocketTypingPayload) => {
      if (!socket.user) return;

      const { receiverId, roomId, isTyping } = data;

      if (receiverId) {
        // Private chat typing
        io.to(`user:${receiverId}`).emit('user-typing', {
          userId: socket.user.id,
          isTyping,
        });
      } else if (roomId) {
        // Room chat typing
        socket.to(roomId).emit('user-typing', {
          userId: socket.user.id,
          roomId,
          isTyping,
        });
      }
    });

    /**
     * Mark message as read
     */
    socket.on('mark-read', async (data: { messageId: string }) => {
      try {
        if (!socket.user) return;

        const { messageId } = data;

        // Update message read status
        const message = await prisma.message.update({
          where: {
            id: messageId,
            receiverId: socket.user.id, // Only allow marking own received messages as read
          },
          data: {
            isRead: true,
          },
        });

        // Notify sender that message was read
        if (message.senderId) {
          io.to(`user:${message.senderId}`).emit('message-read', {
            messageId,
            readBy: socket.user.id,
          });
        }

        socket.emit('message-read-success', { messageId });
      } catch (error) {
        console.error('Mark read error:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    /**
     * Join custom room
     */
    socket.on('join-room', (data: { roomId: string }) => {
      const { roomId } = data;
      socket.join(roomId);
      console.log(`User ${socket.user?.email} joined room: ${roomId}`);
    });

    /**
     * Leave custom room
     */
    socket.on('leave-room', (data: { roomId: string }) => {
      const { roomId } = data;
      socket.leave(roomId);
      console.log(`User ${socket.user?.email} left room: ${roomId}`);
    });

    /**
     * Update user status
     */
    socket.on('update-status', async (data: { status: 'online' | 'away' | 'busy' }) => {
      if (!socket.user) return;

      // Broadcast status to company
      if (socket.user.companyId) {
        io.to(`company:${socket.user.companyId}`).emit('user-status', {
          userId: socket.user.id,
          status: data.status,
        });
      }
    });

    /**
     * Get unread message count
     */
    socket.on('get-unread-count', async () => {
      try {
        if (!socket.user) return;

        const unreadCount = await prisma.message.count({
          where: {
            receiverId: socket.user.id,
            isRead: false,
          },
        });

        socket.emit('unread-count', { count: unreadCount });
      } catch (error) {
        console.error('Get unread count error:', error);
      }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user?.email} (${socket.id})`);

      if (socket.user) {
        // Set user offline status
        await setUserOnlineStatus(socket.user.id, false);

        // Broadcast user offline status
        io.emit('user-status', {
          userId: socket.user.id,
          status: 'offline',
        });
      }
    });
  });

  return io;
};

