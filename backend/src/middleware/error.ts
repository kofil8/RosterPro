import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/helpers";

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("❌ Error:", err);

  // mark unused params as used to satisfy TypeScript / linter checks
  void req;
  void next;

  // Prisma errors
  if (err.code === "P2002") {
    res
      .status(409)
      .json(errorResponse("Duplicate entry", "Resource already exists"));
    return;
  }

  if (err.code === "P2025") {
    res
      .status(404)
      .json(
        errorResponse(
          "Record not found",
          "The requested resource does not exist"
        )
      );
    return;
  }

  // Validation errors
  if (err.name === "ValidationError") {
    res.status(400).json(errorResponse("Validation failed", err.message));
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res
      .status(401)
      .json(errorResponse("Invalid token", "Authentication failed"));
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json(errorResponse("Token expired", "Please login again"));
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json(errorResponse(message, "An error occurred"));
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res
    .status(404)
    .json(errorResponse("Route not found", `Cannot ${req.method} ${req.path}`));
};

/**
 * Async handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
