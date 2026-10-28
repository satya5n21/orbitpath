import { createApp } from './app.js';
import { assertGeminiConfigured, env } from './config/env.js';

if (env.AI_PROVIDER === 'gemini') {
    try {
        assertGeminiConfigured(env);
    } catch (err) {
        console.warn(
            `[OrbitPath Startup Warning] ${(err as Error).message} Requests to /api/roadmaps/generate will return a 503 configuration error until set.`
        );
    }
}

const app = createApp(env);

app.listen(env.PORT, () => {
    console.log(
        `[OrbitPath Server] Listening on http://localhost:${env.PORT} (mode: ${env.AI_PROVIDER})`
    );
});