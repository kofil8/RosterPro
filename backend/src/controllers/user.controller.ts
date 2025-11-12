import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { successResponse, errorResponse, calculatePagination, sanitizeUser } from '../utils/helpers';
import { AuthRequest, CreateUserDTO, UpdateUserDTO } from '../types';
import { UserRole } from '@prisma/client';

/**
 * Create user (for admins to add team members)
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { email, password, firstName, lastName, phone, role }: CreateUserDTO = req.body;
    const companyId = req.user.companyId;

    if (!companyId) {
      res.status(400).json(errorResponse('Company required', 'User must belong to a company'));
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json(errorResponse('User already exists', 'Email is already registered'));
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role (admins can create managers and employees)
    let userRole = role || UserRole.EMPLOYEE;

    // Only allow creating employees if user is a manager
    if (req.user.role === UserRole.MANAGER && role && role !== UserRole.EMPLOYEE) {
      res.status(403).json(errorResponse('Access denied', 'Managers can only create employees'));
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: userRole,
        companyId,
      },
    });

    res.status(201).json(successResponse(sanitizeUser(user), 'User created successfully'));
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json(errorResponse('Failed to create user', 'An error occurred'));
  }
};

/**
 * Get all users in company
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const companyId = req.user.companyId;

    if (!companyId) {
      res.status(400).json(errorResponse('Company required', 'User must belong to a company'));
      return;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { companyId },
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { companyId } }),
    ]);

    const pagination = calculatePagination(pageNum, limitNum, total);

    res.json(
      successResponse(
        {
          users,
          pagination,
        },
        'Users retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(errorResponse('Failed to get users', 'An error occurred'));
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'User does not exist'));
      return;
    }

    // Check access
    if (
      req.user.role !== UserRole.SUPER_ADMIN &&
      req.user.companyId !== user.companyId &&
      req.user.id !== user.id
    ) {
      res.status(403).json(errorResponse('Access denied', 'You do not have access to this user'));
      return;
    }

    res.json(successResponse(sanitizeUser(user), 'User retrieved successfully'));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(errorResponse('Failed to get user', 'An error occurred'));
  }
};

/**
 * Update user
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;
    const updateData: UpdateUserDTO = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json(errorResponse('User not found', 'User does not exist'));
      return;
    }

    // Check access
    const isOwnProfile = req.user.id === id;
    const isSameCompany = req.user.companyId === existingUser.companyId;
    const isAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;

    if (!isOwnProfile && (!isSameCompany || !isAdmin)) {
      res.status(403).json(errorResponse('Access denied', 'You do not have permission to update this user'));
      return;
    }

    // Only admins can change roles
    if (updateData.role && !isAdmin) {
      res.status(403).json(errorResponse('Access denied', 'Only admins can change user roles'));
      return;
    }

    // Prevent changing own role
    if (updateData.role && isOwnProfile) {
      res.status(400).json(errorResponse('Invalid operation', 'You cannot change your own role'));
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json(successResponse(sanitizeUser(user), 'User updated successfully'));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(errorResponse('Failed to update user', 'An error occurred'));
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'User does not exist'));
      return;
    }

    // Prevent self-deletion
    if (req.user.id === id) {
      res.status(400).json(errorResponse('Invalid operation', 'You cannot delete your own account'));
      return;
    }

    // Check access
    if (req.user.role !== UserRole.SUPER_ADMIN && req.user.companyId !== user.companyId) {
      res.status(403).json(errorResponse('Access denied', 'You do not have permission to delete this user'));
      return;
    }

    // Only admins can delete users
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json(errorResponse('Access denied', 'Only admins can delete users'));
      return;
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json(successResponse(null, 'User deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(errorResponse('Failed to delete user', 'An error occurred'));
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated', 'Authentication required'));
      return;
    }

    const { id } = req.params;

    // Check if user exists and has access
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found', 'User does not exist'));
      return;
    }

    const isOwnProfile = req.user.id === id;
    const isSameCompany = req.user.companyId === user.companyId;

    if (!isOwnProfile && !isSameCompany) {
      res.status(403).json(errorResponse('Access denied', 'You do not have access to this user'));
      return;
    }

    // Get shift statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalShifts, completedShifts, upcomingShifts, shiftsThisMonth] = await Promise.all([
      prisma.shift.count({
        where: { assignedUserId: id },
      }),
      prisma.shift.count({
        where: {
          assignedUserId: id,
          status: 'COMPLETED',
        },
      }),
      prisma.shift.count({
        where: {
          assignedUserId: id,
          startTime: { gte: now },
        },
      }),
      prisma.shift.count({
        where: {
          assignedUserId: id,
          startTime: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const stats = {
      totalShifts,
      completedShifts,
      upcomingShifts,
      shiftsThisMonth,
    };

    res.json(successResponse(stats, 'User statistics retrieved successfully'));
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json(errorResponse('Failed to get user statistics', 'An error occurred'));
  }
};

