import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

const SessionHeaderSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_-]{12,64}$/, 'Invalid guest session identifier format.');

declare global {
  namespace Express {
    interface Request {
      guestSessionId: string;
    }
  }
}

export async function requireGuestSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawHeader = req.header('x-guest-session-id');
    const parsed = SessionHeaderSchema.safeParse(rawHeader);
    if (!parsed.success) {
      res.status(400).json({
        error: 'SESSION_REQUIRED',
        message: 'A valid x-guest-session-id header is required to isolate your workspace.'
      });
      return;
    }

    const sessionId = parsed.data;
    await prisma.guestSession.upsert({
      where: { id: sessionId },
      update: { lastSeenAt: new Date() },
      create: { id: sessionId }
    });

    req.guestSessionId = sessionId;
    next();
  } catch (err) {
    next(err);
  }
}