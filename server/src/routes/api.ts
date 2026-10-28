import { Router } from 'express';
import {
  CreateRoadmapRequestSchema,
  GoalGenerationInputSchema,
  UpdateRoadmapRequestSchema
} from '@orbitpath/shared';
import { type AppEnv, env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { requireGuestSession } from '../middleware/session.js';
import { getAiProvider } from '../providers/index.js';
import {
  completeMilestoneSequential,
  formatRoadmapRecord,
  undoLatestMilestoneCompletion,
  updateRoadmapWithProgressGuard
} from '../services/progressionService.js';
import {
  enforceGenerationQuotaAndDeduplicate,
  getSessionQuotaStatus,
  recordGenerationAttempt
} from '../services/quotaService.js';

export function createApiRouter(runtimeEnv: AppEnv = env): Router {
  const router = Router();
  const generationLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

  router.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'ok',
        aiProvider: runtimeEnv.AI_PROVIDER,
        database: 'connected'
      });
    } catch {
      res.status(503).json({
        status: 'degraded',
        aiProvider: runtimeEnv.AI_PROVIDER,
        database: 'unavailable',
        message: 'PostgreSQL database is currently unreachable.'
      });
    }
  });

  router.use(requireGuestSession);

  router.post('/roadmaps/generate', generationLimiter, async (req, res, next) => {
    try {
      const input = GoalGenerationInputSchema.parse(req.body);
      const sessionId = req.guestSessionId;
      const provider = getAiProvider(runtimeEnv);

      const { goalHash } = await enforceGenerationQuotaAndDeduplicate(
        sessionId,
        input.goal,
        provider.providerName
      );

      try {
        const result = await provider.generateVariants(input);
        await recordGenerationAttempt({
          sessionId,
          goalHash,
          provider: provider.providerName,
          succeeded: true
        });

        const quota = await getSessionQuotaStatus(sessionId, provider.providerName);

        res.json({
          goalInput: input,
          provider: provider.providerName,
          variants: result.variants,
          quota
        });
      } catch (genErr) {
        await recordGenerationAttempt({
          sessionId,
          goalHash,
          provider: provider.providerName,
          succeeded: false
        });
        throw genErr;
      }
    } catch (err) {
      next(err);
    }
  });

  router.post('/roadmaps', async (req, res, next) => {
    try {
      const payload = CreateRoadmapRequestSchema.parse(req.body);
      const sessionId = req.guestSessionId;

      const created = await prisma.roadmap.create({
        data: {
          sessionId,
          title: payload.title,
          goalSummary: payload.goalSummary,
          strategyType: payload.strategyType,
          strategyName: payload.strategyName,
          description: payload.description,
          intendedProfile: payload.intendedProfile,
          expectedOutcome: payload.expectedOutcome,
          estimatedTotalEffort: payload.estimatedTotalEffort,
          tradeOffs: payload.tradeOffs,
          assumptions: payload.assumptions,
          milestones: {
            create: payload.milestones.map((m, idx) => ({
              position: idx,
              title: m.title,
              shortDescription: m.shortDescription,
              actionableInstructions: m.actionableInstructions,
              completionCriterion: m.completionCriterion,
              estimatedEffort: m.estimatedEffort,
              iconCategory: m.iconCategory,
              resourceSuggestions: m.resourceSuggestions ?? []
            }))
          }
        },
        include: {
          milestones: { orderBy: { position: 'asc' } },
          achievement: true
        }
      });

      res.status(201).json({ roadmap: formatRoadmapRecord(created) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/roadmaps', async (req, res, next) => {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const roadmaps = await prisma.roadmap.findMany({
        where: {
          sessionId: req.guestSessionId,
          ...(includeArchived ? {} : { archived: false })
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          milestones: { orderBy: { position: 'asc' } },
          achievement: true
        }
      });

      res.json({
        roadmaps: roadmaps.map(formatRoadmapRecord)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/roadmaps/:roadmapId', async (req, res, next) => {
    try {
      const roadmap = await prisma.roadmap.findFirst({
        where: {
          id: req.params.roadmapId,
          sessionId: req.guestSessionId
        },
        include: {
          milestones: { orderBy: { position: 'asc' } },
          achievement: true
        }
      });

      if (!roadmap) {
        throw new AppError(404, 'ROADMAP_NOT_FOUND', 'Roadmap not found in your workspace.');
      }

      res.json({ roadmap: formatRoadmapRecord(roadmap) });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/roadmaps/:roadmapId', async (req, res, next) => {
    try {
      const payload = UpdateRoadmapRequestSchema.parse(req.body);
      const updated = await updateRoadmapWithProgressGuard({
        sessionId: req.guestSessionId,
        roadmapId: req.params.roadmapId!,
        payload
      });
      res.json({ roadmap: updated });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/roadmaps/:roadmapId', async (req, res, next) => {
    try {
      const existing = await prisma.roadmap.findFirst({
        where: {
          id: req.params.roadmapId,
          sessionId: req.guestSessionId
        }
      });

      if (!existing) {
        throw new AppError(404, 'ROADMAP_NOT_FOUND', 'Roadmap not found in your workspace.');
      }

      await prisma.roadmap.delete({ where: { id: existing.id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.post('/roadmaps/:roadmapId/steps/:stepId/complete', async (req, res, next) => {
    try {
      const result = await completeMilestoneSequential({
        sessionId: req.guestSessionId,
        roadmapId: req.params.roadmapId!,
        stepId: req.params.stepId!
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/roadmaps/:roadmapId/steps/:stepId/undo', async (req, res, next) => {
    try {
      const result = await undoLatestMilestoneCompletion({
        sessionId: req.guestSessionId,
        roadmapId: req.params.roadmapId!,
        stepId: req.params.stepId!
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/achievements', async (req, res, next) => {
    try {
      const achievements = await prisma.achievement.findMany({
        where: { sessionId: req.guestSessionId },
        orderBy: { earnedAt: 'desc' }
      });

      res.json({
        achievements: achievements.map((a) => ({
          id: a.id,
          roadmapId: a.roadmapId,
          title: a.title,
          badgeLabel: a.badgeLabel,
          constellationTheme: a.constellationTheme,
          featured: a.featured,
          earnedAt: a.earnedAt.toISOString()
        }))
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/achievements/:achievementId/feature', async (req, res, next) => {
    try {
      const target = await prisma.achievement.findFirst({
        where: { id: req.params.achievementId, sessionId: req.guestSessionId }
      });
      if (!target) {
        throw new AppError(404, 'ACHIEVEMENT_NOT_FOUND', 'Achievement not found.');
      }

      await prisma.$transaction([
        prisma.achievement.updateMany({
          where: { sessionId: req.guestSessionId },
          data: { featured: false }
        }),
        prisma.achievement.update({
          where: { id: target.id },
          data: { featured: true }
        })
      ]);

      const achievements = await prisma.achievement.findMany({
        where: { sessionId: req.guestSessionId },
        orderBy: { earnedAt: 'desc' }
      });

      res.json({
        achievements: achievements.map((a) => ({
          id: a.id,
          roadmapId: a.roadmapId,
          title: a.title,
          badgeLabel: a.badgeLabel,
          constellationTheme: a.constellationTheme,
          featured: a.featured,
          earnedAt: a.earnedAt.toISOString()
        }))
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/profile', async (req, res, next) => {
    try {
      const sessionId = req.guestSessionId;
      const [roadmaps, achievements, quota] = await Promise.all([
        prisma.roadmap.findMany({
          where: { sessionId },
          orderBy: { updatedAt: 'desc' },
          include: {
            milestones: { orderBy: { position: 'asc' } },
            achievement: true
          }
        }),
        prisma.achievement.findMany({
          where: { sessionId },
          orderBy: { earnedAt: 'desc' }
        }),
        getSessionQuotaStatus(sessionId, runtimeEnv.AI_PROVIDER)
      ]);

      const formattedRoadmaps = roadmaps.map(formatRoadmapRecord);
      const totalCompletedMilestones = formattedRoadmaps.reduce(
        (sum, r) => sum + r.progressCount,
        0
      );
      const featuredAchievement =
        achievements.find((a) => a.featured) ?? achievements[0] ?? null;

      res.json({
        profile: {
          sessionId,
          totalRoadmaps: formattedRoadmaps.length,
          completedRoadmapsCount: formattedRoadmaps.filter((r) => r.completedAt !== null).length,
          totalCompletedMilestones,
          featuredAchievement: featuredAchievement
            ? {
              id: featuredAchievement.id,
              roadmapId: featuredAchievement.roadmapId,
              title: featuredAchievement.title,
              badgeLabel: featuredAchievement.badgeLabel,
              constellationTheme: featuredAchievement.constellationTheme,
              featured: featuredAchievement.featured,
              earnedAt: featuredAchievement.earnedAt.toISOString()
            }
            : null,
          achievements: achievements.map((a) => ({
            id: a.id,
            roadmapId: a.roadmapId,
            title: a.title,
            badgeLabel: a.badgeLabel,
            constellationTheme: a.constellationTheme,
            featured: a.featured,
            earnedAt: a.earnedAt.toISOString()
          })),
          roadmaps: formattedRoadmaps,
          quota
        }
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}