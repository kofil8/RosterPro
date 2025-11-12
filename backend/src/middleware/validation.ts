import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { errorResponse } from '../utils/helpers';

/**
 * Validate request body middleware
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json(errorResponse('Validation failed', JSON.stringify(errors)));
        return;
      }
      next(error);
    }
  };
};

/**
 * Validate query parameters middleware
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json(errorResponse('Validation failed', JSON.stringify(errors)));
        return;
      }
      next(error);
    }
  };
};

/**
 * Validate params middleware
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json(errorResponse('Validation failed', JSON.stringify(errors)));
        return;
      }
      next(error);
    }
  };
};

// Common validation schemas
export const idParamSchema = z.object({
  id: z.string().cuid(),
});

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

