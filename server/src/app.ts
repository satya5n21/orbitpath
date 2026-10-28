import cors from 'cors';
import express, { type Express } from 'express';
import { type AppEnv, env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { createApiRouter } from './routes/api.js';

export function createApp(runtimeEnv: AppEnv = env): Express {
    const app = express();

    app.use(
        cors({
            origin: runtimeEnv.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
            credentials: true
        })
    );

    app.use(express.json({ limit: '64kb' }));
    app.use('/api', createRateLimiter({ windowMs: 60_000, maxRequests: 120 }));
    app.use('/api', createApiRouter(runtimeEnv));
    app.use(errorHandler);

    return app;
}