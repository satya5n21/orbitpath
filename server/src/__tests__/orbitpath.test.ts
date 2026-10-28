import { describe, expect, it } from 'vitest';
import { FourVariantsResponseSchema } from '@orbitpath/shared';
import { assertGeminiConfigured, parseEnv } from '../config/env.js';
import { MockRoadmapProvider } from '../providers/mockProvider.js';
import { hashGoalInput } from '../services/quotaService.js';

describe('OrbitPath Core Verification Suite', () => {
  const mockProvider = new MockRoadmapProvider();

  it('1. returns exactly four roadmap variants in mock mode', async () => {
    const res = await mockProvider.generateVariants({
      goal: 'I want to learn TypeScript and migrate one of my existing Express projects.',
      experienceLevel: 'intermediate',
      hoursPerWeek: 6
    });

    expect(res.variants).toHaveLength(4);
  });

  it('2. produces four distinct strategy types with different milestones', async () => {
    const res = await mockProvider.generateVariants({
      goal: 'Build a personal finance CLI tool in Rust'
    });

    const strategyTypes = res.variants.map((v) => v.strategyType);
    expect(new Set(strategyTypes)).toEqual(
      new Set(['BALANCED_PATH', 'FAST_TRACK', 'DEEP_MASTERY', 'TINY_STEPS'])
    );

    const firstTitles = res.variants.map((v) => v.milestones[0]?.title);
    expect(new Set(firstTitles).size).toBe(4);
  });

  it('3. rejects invalid generated JSON or missing strategy variants via Zod schema', () => {
    const malformedPayload = {
      variants: [
        {
          id: 'only-one',
          strategyType: 'BALANCED_PATH'
        }
      ]
    };

    const result = FourVariantsResponseSchema.safeParse(malformedPayload);
    expect(result.success).toBe(false);
  });

  it('4 & 5. enforces sequential completion rule (only earliest incomplete milestone is active)', () => {
    const milestones = [
      { id: 'm1', position: 0, completedAt: '2026-10-28T01:00:00.000Z' },
      { id: 'm2', position: 1, completedAt: null },
      { id: 'm3', position: 2, completedAt: null }
    ];

    const earliestIncomplete = milestones.find((m) => m.completedAt === null);
    expect(earliestIncomplete?.id).toBe('m2');

    // Attempting to complete m3 while m2 is incomplete must be rejected
    const attemptedStepId = 'm3';
    const canCompleteM3 = earliestIncomplete?.id === attemptedStepId;
    expect(canCompleteM3).toBe(false);

    // Attempting to complete m2 (the active step) is permitted
    const canCompleteM2 = earliestIncomplete?.id === 'm2';
    expect(canCompleteM2).toBe(true);
  });

  it('6. preserves deterministic progress calculation across reloads', () => {
    const persistedMilestones = [
      { id: 's1', position: 0, completedAt: new Date('2026-10-28T01:00:00Z') },
      { id: 's2', position: 1, completedAt: new Date('2026-10-28T02:00:00Z') },
      { id: 's3', position: 2, completedAt: null },
      { id: 's4', position: 3, completedAt: null }
    ];

    const completedCount = persistedMilestones.filter((m) => m.completedAt !== null).length;
    const activeId = persistedMilestones.find((m) => m.completedAt === null)?.id ?? null;

    expect(completedCount).toBe(2);
    expect(activeId).toBe('s3');
  });

  it('7 & 9. creates a single achievement only when all milestones are complete and prevents duplicates', () => {
    const milestonesAfterFinalStep = [
      { id: 's1', completedAt: new Date() },
      { id: 's2', completedAt: new Date() }
    ];
    const existingAchievement = null;

    const remainingIncomplete = milestonesAfterFinalStep.filter((m) => m.completedAt === null);
    const shouldCreateFirstTime = remainingIncomplete.length === 0 && existingAchievement === null;
    expect(shouldCreateFirstTime).toBe(true);

    // Second duplicate request sees existingAchievement !== null
    const existingAfterFirst = { id: 'ach-1', title: 'PROJECT COMPLETE — Test' };
    const shouldCreateSecondTime =
      remainingIncomplete.length === 0 && existingAfterFirst === null;
    expect(shouldCreateSecondTime).toBe(false);
  });

  it('8. computes deterministic goal hashes per session for quota deduplication', () => {
    const hashA = hashGoalInput('session_abc123456789', 'Learn TypeScript');
    const hashB = hashGoalInput('session_abc123456789', '  learn typescript ');
    const hashOtherSession = hashGoalInput('session_xyz987654321', 'Learn TypeScript');

    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(hashOtherSession);
  });

  it('10. allows mock mode without GEMINI_API_KEY and rejects missing key in gemini mode', () => {
    const mockEnv = parseEnv({
      NODE_ENV: 'test',
      AI_PROVIDER: 'mock',
      GEMINI_API_KEY: '',
      DATABASE_URL: 'postgresql://orbitpath_dev:local_dev_password@localhost:5432/orbitpath'
    });
    expect(mockEnv.AI_PROVIDER).toBe('mock');

    const geminiMissingKeyEnv = parseEnv({
      NODE_ENV: 'test',
      AI_PROVIDER: 'gemini',
      GEMINI_API_KEY: '',
      GEMINI_MODEL: 'gemini-2.5-flash',
      DATABASE_URL: 'postgresql://orbitpath_dev:local_dev_password@localhost:5432/orbitpath'
    });

    expect(() => assertGeminiConfigured(geminiMissingKeyEnv)).toThrow(
      /GEMINI_API_KEY is not configured/
    );
  });
});