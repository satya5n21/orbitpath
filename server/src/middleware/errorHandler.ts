import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: firstIssue
        ? `${firstIssue.path.join('.') || 'Input'}: ${firstIssue.message}`
        : 'Invalid request payload.'
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message
    });
    return;
  }

  const maybeStatus = (err as { statusCode?: number; code?: string })?.statusCode;
  const maybeCode = (err as { statusCode?: number; code?: string })?.code;
  if (typeof maybeStatus === 'number' && err instanceof Error) {
    res.status(maybeStatus).json({
      error: maybeCode ?? 'APPLICATION_ERROR',
      message: err.message
    });
    return;
  }

  // Log safely without leaking secrets or stack traces to the client
  const safeErrorName = err instanceof Error ? err.name : 'UnknownError';
  console.error(`[OrbitPath Server Error] ${safeErrorName}`);

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected server error occurred. Please try again.'
  });
}