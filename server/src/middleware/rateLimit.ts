import type { Request, Response, NextFunction } from 'express';

interface Bucket {
    count: number;
    resetAt: number;
}

export function createRateLimiter(options: { windowMs: number; maxRequests: number }) {
    const buckets = new Map<string, Bucket>();

    return (req: Request, res: Response, next: NextFunction): void => {
        const key = req.header('x-guest-session-id') ?? req.ip ?? 'anonymous';
        const now = Date.now();
        const existing = buckets.get(key);

        if (!existing || existing.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + options.windowMs });
            next();
            return;
        }

        if (existing.count >= options.maxRequests) {
            res.status(429).json({
                error: 'RATE_LIMITED',
                message: 'Too many requests in a short window. Take a breath and try again shortly.'
            });
            return;
        }

        existing.count += 1;
        next();
    };
}