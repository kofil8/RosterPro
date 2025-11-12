import { MessageType, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { Server as HTTPServer } from "http";
import { AddressInfo } from "net";
import { Server as SocketIOServer } from "socket.io";
import { Socket as ClientSocket, io as ioClient } from "socket.io-client";
import prisma from "../config/database";
import { generateAccessToken } from "../services/jwt.service";
import { initializeSocketServer } from "../socket/chat.socket";

describe("Employee to Admin Messaging", () => {
  let httpServer: HTTPServer;
  let ioServer: SocketIOServer;
  let employeeSocket: ClientSocket;
  let adminSocket: ClientSocket;
  let employee: any;
  let admin: any;
  let company: any;
  let employeeToken: string;
  let adminToken: string;
  let serverPort: number;

  beforeAll(async () => {
    // Create test company
    company = await prisma.company.create({
      data: {
        name: "Test Company",
        email: "testcompany@example.com",
        timezone: "UTC",
      },
    });

    // Create test admin user
    const adminPassword = await bcrypt.hash("password123", 10);
    admin = await prisma.user.create({
      data: {
        email: "admin@testcompany.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        role: UserRole.ADMIN,
        companyId: company.id,
      },
    });

    // Create test employee user
    const employeePassword = await bcrypt.hash("password123", 10);
    employee = await prisma.user.create({
      data: {
        email: "employee@testcompany.com",
        password: employeePassword,
        firstName: "Employee",
        lastName: "User",
        role: UserRole.EMPLOYEE,
        companyId: company.id,
      },
    });

    // Generate JWT tokens
    employeeToken = generateAccessToken({
      id: employee.id,
      email: employee.email,
      role: employee.role,
      companyId: employee.companyId,
    });

    adminToken = generateAccessToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      companyId: admin.companyId,
    });

    // Initialize HTTP server and Socket.IO
    httpServer = new HTTPServer();
    ioServer = initializeSocketServer(httpServer);

    // Start server
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address() as AddressInfo;
        serverPort = address.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Close sockets
    if (employeeSocket) employeeSocket.close();
    if (adminSocket) adminSocket.close();

    // Close server
    await new Promise<void>((resolve) => {
      ioServer.close(() => {
        httpServer.close(() => {
          resolve();
        });
      });
    });

    // Clean up test data
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: employee.id },
          { receiverId: employee.id },
          { senderId: admin.id },
          { receiverId: admin.id },
        ],
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [employee.id, admin.id] },
      },
    });

    await prisma.company.delete({
      where: { id: company.id },
    });

    await prisma.$disconnect();
  });

  beforeEach((done: jest.DoneCallback) => {
    // Connect employee socket
    employeeSocket = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: employeeToken },
      transports: ["websocket"],
    });

    // Connect admin socket
    adminSocket = ioClient(`http://localhost:${serverPort}`, {
      auth: { token: adminToken },
      transports: ["websocket"],
    });

    // Wait for both connections
    let employeeConnected = false;
    let adminConnected = false;

    const checkConnections = () => {
      if (employeeConnected && adminConnected) {
        done();
      }
    };

    employeeSocket.on("connect", () => {
      employeeConnected = true;
      checkConnections();
    });

    adminSocket.on("connect", () => {
      adminConnected = true;
      checkConnections();
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!employeeConnected || !adminConnected) {
        done(new Error("Socket connection timeout"));
      }
    }, 5000);
  });

  afterEach((done: jest.DoneCallback) => {
    // Disconnect sockets
    if (employeeSocket.connected) {
      employeeSocket.disconnect();
    }
    if (adminSocket.connected) {
      adminSocket.disconnect();
    }

    // Wait a bit for cleanup
    setTimeout(done, 100);
  });

  test("Employee should send a message to admin", (done: jest.DoneCallback) => {
    const messageContent = "Hello Admin, I need help with my schedule.";

    // Admin listens for the message
    adminSocket.once("private-message", async (message: any) => {
      try {
        // Verify message structure
        expect(message).toHaveProperty("id");
        expect(message).toHaveProperty("content", messageContent);
        expect(message).toHaveProperty("type", MessageType.PRIVATE);
        expect(message).toHaveProperty("senderId", employee.id);
        expect(message).toHaveProperty("receiverId", admin.id);
        expect(message).toHaveProperty("isRead", false);
        expect(message).toHaveProperty("sender");
        expect(message).toHaveProperty("receiver");

        // Verify sender details
        expect(message.sender).toHaveProperty("id", employee.id);
        expect(message.sender).toHaveProperty("email", employee.email);
        expect(message.sender).toHaveProperty("firstName", employee.firstName);

        // Verify receiver details
        expect(message.receiver).toHaveProperty("id", admin.id);
        expect(message.receiver).toHaveProperty("email", admin.email);

        // Verify message was saved to database
        const dbMessage = await prisma.message.findUnique({
          where: { id: message.id },
          include: {
            sender: true,
            receiver: true,
          },
        });

        expect(dbMessage).toBeTruthy();
        expect(dbMessage?.content).toBe(messageContent);
        expect(dbMessage?.senderId).toBe(employee.id);
        expect(dbMessage?.receiverId).toBe(admin.id);
        expect(dbMessage?.type).toBe(MessageType.PRIVATE);

        done();
      } catch (error) {
        done(error);
      }
    });

    // Employee sends message
    employeeSocket.emit("private-message", {
      receiverId: admin.id,
      content: messageContent,
    });

    // Also listen for confirmation on employee socket
    employeeSocket.once("private-message", (message: any) => {
      expect(message.content).toBe(messageContent);
      expect(message.receiverId).toBe(admin.id);
    });
  });

  test("Admin should receive and reply to employee message", (done: jest.DoneCallback) => {
    const employeeMessage = "Hello Admin, I have a question.";
    const adminReply = "Hello Employee, how can I help you?";

    // Step 1: Employee sends message
    adminSocket.once("private-message", async (message: any) => {
      try {
        expect(message.content).toBe(employeeMessage);
        expect(message.senderId).toBe(employee.id);
        expect(message.receiverId).toBe(admin.id);

        // Step 2: Admin replies
        // Employee listens for admin's reply
        employeeSocket.once("private-message", async (replyMessage: any) => {
          try {
            // Verify reply structure
            expect(replyMessage).toHaveProperty("id");
            expect(replyMessage).toHaveProperty("content", adminReply);
            expect(replyMessage).toHaveProperty("type", MessageType.PRIVATE);
            expect(replyMessage).toHaveProperty("senderId", admin.id);
            expect(replyMessage).toHaveProperty("receiverId", employee.id);
            expect(replyMessage).toHaveProperty("isRead", false);

            // Verify sender is admin
            expect(replyMessage.sender).toHaveProperty("id", admin.id);
            expect(replyMessage.sender).toHaveProperty("email", admin.email);
            expect(replyMessage.sender).toHaveProperty("role", UserRole.ADMIN);

            // Verify receiver is employee
            expect(replyMessage.receiver).toHaveProperty("id", employee.id);
            expect(replyMessage.receiver).toHaveProperty(
              "email",
              employee.email
            );

            // Verify reply was saved to database
            const dbReply = await prisma.message.findUnique({
              where: { id: replyMessage.id },
              include: {
                sender: true,
                receiver: true,
              },
            });

            expect(dbReply).toBeTruthy();
            expect(dbReply?.content).toBe(adminReply);
            expect(dbReply?.senderId).toBe(admin.id);
            expect(dbReply?.receiverId).toBe(employee.id);
            expect(dbReply?.type).toBe(MessageType.PRIVATE);

            // Verify both messages exist in database
            const conversation = await prisma.message.findMany({
              where: {
                OR: [
                  {
                    senderId: employee.id,
                    receiverId: admin.id,
                  },
                  {
                    senderId: admin.id,
                    receiverId: employee.id,
                  },
                ],
              },
              orderBy: { createdAt: "asc" },
            });

            expect(conversation.length).toBeGreaterThanOrEqual(2);
            expect(conversation[0].content).toBe(employeeMessage);
            expect(conversation[conversation.length - 1].content).toBe(
              adminReply
            );

            done();
          } catch (error) {
            done(error);
          }
        });

        // Admin sends reply
        adminSocket.emit("private-message", {
          receiverId: employee.id,
          content: adminReply,
        });
      } catch (error) {
        done(error);
      }
    });

    // Employee sends initial message
    employeeSocket.emit("private-message", {
      receiverId: admin.id,
      content: employeeMessage,
    });
  });

  test("Should not allow sending message to user from different company", (done: jest.DoneCallback) => {
    // Create a user from a different company
    prisma.company
      .create({
        data: {
          name: "Other Company",
          email: "other@example.com",
          timezone: "UTC",
        },
      })
      .then((otherCompany) => {
        return prisma.user.create({
          data: {
            email: "otheruser@example.com",
            password: "hashedpassword",
            firstName: "Other",
            lastName: "User",
            role: UserRole.EMPLOYEE,
            companyId: otherCompany.id,
          },
        });
      })
      .then((otherUser) => {
        // Employee tries to send message to user from different company
        employeeSocket.once("error", (error: any) => {
          expect(error.message).toBe(
            "Cannot send message to user from different company"
          );
          done();
        });

        employeeSocket.emit("private-message", {
          receiverId: otherUser.id,
          content: "This should fail",
        });

        // Cleanup
        setTimeout(async () => {
          await prisma.user.delete({ where: { id: otherUser.id } });
          await prisma.company.delete({ where: { id: otherUser.companyId! } });
        }, 1000);
      })
      .catch((error) => {
        done(error);
      });
  });

  test("Should validate required fields when sending message", (done: jest.DoneCallback) => {
    // Test missing content
    employeeSocket.once("error", (error: any) => {
      expect(error.message).toBe("Missing required fields");
      done();
    });

    employeeSocket.emit("private-message", {
      receiverId: admin.id,
      // content is missing
    });
  });

  test("Should handle unread count correctly", (done: jest.DoneCallback) => {
    const messageContent = "Test unread count message";

    // Admin requests unread count before receiving message
    adminSocket.emit("get-unread-count");
    adminSocket.once("unread-count", (data: any) => {
      const initialCount = data.count;

      // Employee sends message
      adminSocket.once("private-message", async () => {
        // Admin requests unread count again
        adminSocket.emit("get-unread-count");
        adminSocket.once("unread-count", (data: any) => {
          expect(data.count).toBe(initialCount + 1);
          done();
        });
      });

      employeeSocket.emit("private-message", {
        receiverId: admin.id,
        content: messageContent,
      });
    });
  });
});
