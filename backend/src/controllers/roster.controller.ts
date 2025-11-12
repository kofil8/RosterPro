import { UserRole } from "@prisma/client";
import { Response } from "express";
import prisma from "../config/database";
import {
  AuthRequest,
  CreateRosterDTO,
  RosterQueryParams,
  UpdateRosterDTO,
} from "../types";
import {
  calculatePagination,
  errorResponse,
  isValidDateRange,
  successResponse,
} from "../utils/helpers";

/**
 * Create roster
 */
export const createRoster = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("Not authenticated", "Authentication required"));
      return;
    }

    // Check access - only ADMIN and MANAGER can create rosters
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MANAGER
    ) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "Only Admin and Manager can create rosters"
          )
        );
      return;
    }

    const { title, description, startDate, endDate }: CreateRosterDTO =
      req.body;
    const companyId = req.user.companyId;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      res
        .status(400)
        .json(
          errorResponse(
            "Missing required fields",
            "Title, startDate, and endDate are required"
          )
        );
      return;
    }

    if (!companyId) {
      res
        .status(400)
        .json(
          errorResponse("Company required", "User must belong to a company")
        );
      return;
    }

    // Validate and parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      res
        .status(400)
        .json(errorResponse("Invalid start date", "Start date is not valid"));
      return;
    }

    if (isNaN(end.getTime())) {
      res
        .status(400)
        .json(errorResponse("Invalid end date", "End date is not valid"));
      return;
    }

    if (!isValidDateRange(start, end)) {
      res
        .status(400)
        .json(
          errorResponse(
            "Invalid date range",
            "Start date must be before end date"
          )
        );
      return;
    }

    const roster = await prisma.roster.create({
      data: {
        title,
        description: description || null,
        startDate: start,
        endDate: end,
        companyId,
      },
      include: {
        shifts: {
          include: {
            assignedUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    res
      .status(201)
      .json(successResponse(roster, "Roster created successfully"));
  } catch (error: any) {
    console.error("Create roster error:", error);

    // Handle Prisma errors
    if (error.code === "P2002") {
      res
        .status(400)
        .json(
          errorResponse(
            "Duplicate entry",
            "A roster with this information already exists"
          )
        );
      return;
    }

    res
      .status(500)
      .json(
        errorResponse(
          "Failed to create roster",
          error.message || "An error occurred"
        )
      );
  }
};

/**
 * Get all rosters
 */
export const getRosters = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("Not authenticated", "Authentication required"));
      return;
    }

    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      isPublished,
    }: RosterQueryParams = req.query as any;
    const companyId = req.user.companyId;

    if (!companyId) {
      res
        .status(400)
        .json(
          errorResponse("Company required", "User must belong to a company")
        );
      return;
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { companyId };

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    if (isPublished !== undefined) {
      const isPublishedStr = String(isPublished);
      where.isPublished = isPublishedStr === "true" || isPublishedStr === "1";
    }

    // Get rosters
    const [rosters, total] = await Promise.all([
      prisma.roster.findMany({
        where,
        skip,
        take: limit,
        include: {
          shifts: {
            include: {
              assignedUser: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.roster.count({ where }),
    ]);

    const pagination = calculatePagination(page, limit, total);

    res.json(
      successResponse(
        {
          rosters,
          pagination,
        },
        "Rosters retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get rosters error:", error);
    res
      .status(500)
      .json(errorResponse("Failed to get rosters", "An error occurred"));
  }
};

/**
 * Get roster by ID
 */
export const getRosterById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("Not authenticated", "Authentication required"));
      return;
    }

    const { id } = req.params;

    const roster = await prisma.roster.findUnique({
      where: { id },
      include: {
        shifts: {
          include: {
            assignedUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
              },
            },
          },
          orderBy: { startTime: "asc" },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!roster) {
      res
        .status(404)
        .json(errorResponse("Roster not found", "Roster does not exist"));
      return;
    }

    // Check access
    if (roster.companyId !== req.user.companyId) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "You do not have access to this roster"
          )
        );
      return;
    }

    res.json(successResponse(roster, "Roster retrieved successfully"));
  } catch (error) {
    console.error("Get roster error:", error);
    res
      .status(500)
      .json(errorResponse("Failed to get roster", "An error occurred"));
  }
};

/**
 * Update roster
 */
export const updateRoster = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("Not authenticated", "Authentication required"));
      return;
    }

    const { id } = req.params;
    const updateData: UpdateRosterDTO = req.body;

    // Check if roster exists
    const existingRoster = await prisma.roster.findUnique({
      where: { id },
    });

    if (!existingRoster) {
      res
        .status(404)
        .json(errorResponse("Roster not found", "Roster does not exist"));
      return;
    }

    // Check access - only ADMIN and MANAGER can update rosters
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MANAGER
    ) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "Only Admin and Manager can update rosters"
          )
        );
      return;
    }

    // Check company access
    if (existingRoster.companyId !== req.user.companyId) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "You do not have access to this roster"
          )
        );
      return;
    }

    // Parse dates if provided (they come as strings from the API)
    const parsedUpdateData: any = { ...updateData };
    if (updateData.startDate) {
      parsedUpdateData.startDate = new Date(updateData.startDate);
      if (isNaN(parsedUpdateData.startDate.getTime())) {
        res
          .status(400)
          .json(errorResponse("Invalid start date", "Start date is not valid"));
        return;
      }
    }
    if (updateData.endDate) {
      parsedUpdateData.endDate = new Date(updateData.endDate);
      if (isNaN(parsedUpdateData.endDate.getTime())) {
        res
          .status(400)
          .json(errorResponse("Invalid end date", "End date is not valid"));
        return;
      }
    }

    // Validate date range if both dates provided
    if (parsedUpdateData.startDate && parsedUpdateData.endDate) {
      if (!isValidDateRange(parsedUpdateData.startDate, parsedUpdateData.endDate)) {
        res
          .status(400)
          .json(
            errorResponse(
              "Invalid date range",
              "Start date must be before end date"
            )
          );
        return;
      }
    }

    const roster = await prisma.roster.update({
      where: { id },
      data: parsedUpdateData,
      include: {
        shifts: {
          include: {
            assignedUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    res.json(successResponse(roster, "Roster updated successfully"));
  } catch (error) {
    console.error("Update roster error:", error);
    res
      .status(500)
      .json(errorResponse("Failed to update roster", "An error occurred"));
  }
};

/**
 * Delete roster
 */
export const deleteRoster = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("Not authenticated", "Authentication required"));
      return;
    }

    const { id } = req.params;

    // Check if roster exists
    const roster = await prisma.roster.findUnique({
      where: { id },
    });

    if (!roster) {
      res
        .status(404)
        .json(errorResponse("Roster not found", "Roster does not exist"));
      return;
    }

    // Check access - only ADMIN and MANAGER can delete rosters
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MANAGER
    ) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "Only Admin and Manager can delete rosters"
          )
        );
      return;
    }

    // Check company access
    if (roster.companyId !== req.user.companyId) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "You do not have access to this roster"
          )
        );
      return;
    }

    await prisma.roster.delete({
      where: { id },
    });

    res.json(successResponse(null, "Roster deleted successfully"));
  } catch (error) {
    console.error("Delete roster error:", error);
    res
      .status(500)
      .json(errorResponse("Failed to delete roster", "An error occurred"));
  }
};

/**
 * Publish roster
 */
export const publishRoster = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("Not authenticated", "Authentication required"));
      return;
    }

    const { id } = req.params;

    // Check if roster exists
    const roster = await prisma.roster.findUnique({
      where: { id },
      include: {
        shifts: {
          include: {
            assignedUser: true,
          },
        },
      },
    });

    if (!roster) {
      res
        .status(404)
        .json(errorResponse("Roster not found", "Roster does not exist"));
      return;
    }

    // Check access - only ADMIN and MANAGER can publish/unpublish rosters
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MANAGER
    ) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "Only Admin and Manager can publish rosters"
          )
        );
      return;
    }

    // Check company access
    if (roster.companyId !== req.user.companyId) {
      res
        .status(403)
        .json(
          errorResponse(
            "Access denied",
            "You do not have access to this roster"
          )
        );
      return;
    }

    // Check if already published
    if (roster.isPublished) {
      res
        .status(400)
        .json(
          errorResponse("Already published", "Roster is already published")
        );
      return;
    }

    // Publish roster (change status from draft to public)
    const updatedRoster = await prisma.roster.update({
      where: { id },
      data: { isPublished: true },
      include: {
        shifts: {
          include: {
            assignedUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // TODO: Send notifications to all assigned employees

    res.json(successResponse(updatedRoster, "Roster published successfully"));
  } catch (error) {
    console.error("Publish roster error:", error);
    res
      .status(500)
      .json(errorResponse("Failed to publish roster", "An error occurred"));
  }
};
