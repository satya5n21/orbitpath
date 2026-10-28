import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  AI_PROVIDER: z.enum(['mock', 'gemini']).default('mock'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().optional().default('gemini-2.5-flash'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .default('postgresql://orbitpath_dev:local_dev_password@localhost:5432/orbitpath?schema=public')
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function parseEnv(rawEnv: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = EnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    const formatted = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }
  return parsed.data;
}

export function assertGeminiConfigured(currentEnv: AppEnv): { apiKey: string; model: string } {
  const apiKey = currentEnv.GEMINI_API_KEY.trim();
  const model = currentEnv.GEMINI_MODEL.trim();
  if (!apiKey) {
    const error = new Error(
      'Gemini mode is active (AI_PROVIDER=gemini), but GEMINI_API_KEY is not configured on the server.'
    );
    (error as Error & { statusCode?: number; code?: string }).statusCode = 503;
    (error as Error & { statusCode?: number; code?: string }).code = 'GEMINI_CONFIG_MISSING';
    throw error;
  }
  if (!model) {
    const error = new Error(
      'Gemini mode is active (AI_PROVIDER=gemini), but GEMINI_MODEL is not configured on the server.'
    );
    (error as Error & { statusCode?: number; code?: string }).statusCode = 503;
    (error as Error & { statusCode?: number; code?: string }).code = 'GEMINI_MODEL_MISSING';
    throw error;
  }
  return { apiKey, model };
}

export const env = parseEnv();