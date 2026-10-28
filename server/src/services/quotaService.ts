import crypto from 'node:crypto';
import { QUOTA_CONFIG, type QuotaStatus } from '@orbitpath/shared';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export function hashGoalInput(sessionId: string, goal: string): string {
  return crypto
    .createHash('sha256')
    .update(`${sessionId}:${goal.trim().toLowerCase()}`)
    .digest('hex')
    .slice(0, 32);
}

export async function getSessionQuotaStatus(
  sessionId: string,
  aiProvider: 'mock' | 'gemini'
): Promise<QuotaStatus> {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [dailyUsed, monthlyUsed] = await Promise.all([
    prisma.aiGenerationUsage.count({
      where: {
        sessionId,
        succeeded: true,
        createdAt: { gte: startOfDay }
      }
    }),
    prisma.aiGenerationUsage.count({
      where: {
        sessionId,
        succeeded: true,
        createdAt: { gte: startOfMonth }
      }
    })
  ]);

  return {
    dailyUsed,
    dailyLimit: QUOTA_CONFIG.maxGenerationsPerDay,
    monthlyUsed,
    monthlyLimit: QUOTA_CONFIG.maxGenerationsPerMonth,
    remainingToday: Math.max(0, QUOTA_CONFIG.maxGenerationsPerDay - dailyUsed),
    remainingMonth: Math.max(0, QUOTA_CONFIG.maxGenerationsPerMonth - monthlyUsed),
    aiProvider
  };
}

export async function enforceGenerationQuotaAndDeduplicate(
  sessionId: string,
  goal: string,
  aiProvider: 'mock' | 'gemini'
): Promise<{ goalHash: string }> {
  const goalHash = hashGoalInput(sessionId, goal);
  const dedupeCutoff = new Date(Date.now() - QUOTA_CONFIG.deduplicationWindowMs);

  const recentDuplicate = await prisma.aiGenerationUsage.findFirst({
    where: {
      sessionId,
      goalHash,
      succeeded: true,
      createdAt: { gte: dedupeCutoff }
    }
  });

  if (recentDuplicate) {
    throw new AppError(
      409,
      'DUPLICATE_GENERATION_REQUEST',
      'This exact goal was just generated moments ago. Please review your existing variants or wait a few seconds.'
    );
  }

  const quota = await getSessionQuotaStatus(sessionId, aiProvider);

  if (quota.remainingMonth <= 0) {
    throw new AppError(
      429,
      'MONTHLY_QUOTA_EXCEEDED',
      `Monthly AI generation limit reached (${QUOTA_CONFIG.maxGenerationsPerMonth} per month). You can still build custom roadmaps manually at any time.`
    );
  }

  if (quota.remainingToday <= 0) {
    throw new AppError(
      429,
      'DAILY_QUOTA_EXCEEDED',
      `Daily AI generation limit reached (${QUOTA_CONFIG.maxGenerationsPerDay} per day). You can still build custom roadmaps manually or return tomorrow.`
    );
  }

  return { goalHash };
}

export async function recordGenerationAttempt(params: {
  sessionId: string;
  goalHash: string;
  provider: 'mock' | 'gemini';
  succeeded: boolean;
}): Promise<void> {
  await prisma.aiGenerationUsage.create({
    data: {
      sessionId: params.sessionId,
      goalHash: params.goalHash,
      provider: params.provider,
      succeeded: params.succeeded
    }
  });
}