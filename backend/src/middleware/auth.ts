import { UserRole } from "@prisma/client";
import { NextFunction, Response } from "express";
import { verifyAccessToken } from "../services/jwt.service";
import { AuthRequest } from "../types";
import { errorResponse } from "../utils/helpers";

/**
 * Authenticate user middleware
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json(errorResponse("No token provided", "Authentication required"));
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res
        .status(401)
        .json(
          errorResponse("Invalid or expired token", "Authentication failed")
        );
      return;
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    next();
  } catch (error) {
    res
      .status(401)
      .json(errorResponse("Authentication failed", "Invalid token"));
  }
};

/**
 * Authorize by role middleware
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(401)
        .json(errorResponse("Not authenticated", "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json(errorResponse("Insufficient permissions", "Access denied"));
      return;
    }

    next();
  };
};

/**
 * Check if user belongs to company
 */
export const checkCompanyAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res
      .status(401)
      .json(errorResponse("Not authenticated", "Authentication required"));
    return;
  }

  const companyId = req.params.companyId || req.body.companyId;

  if (!companyId) {
    next();
    return;
  }

  // Super admin can access all companies
  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  // Check if user belongs to the company
  if (req.user.companyId !== companyId) {
    res
      .status(403)
      .json(
        errorResponse("Access denied", "You do not have access to this company")
      );
    return;
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);

      if (decoded) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          companyId: decoded.companyId,
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};
