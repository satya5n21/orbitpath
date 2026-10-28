import {
  BRAND_CONFIG,
  normalizeIconCategory,
  pickMotivationalMessage,
  type PersistedAchievement,
  type PersistedRoadmap,
  type ResourceSuggestion,
  type StrategyType,
  type UpdateRoadmapRequest
} from '@orbitpath/shared';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const CONSTELLATION_THEMES = ['Orion', 'Lyra', 'Cygnus', 'Cassiopeia', 'Andromeda'] as const;

export function formatRoadmapRecord(roadmap: {
  id: string;
  title: string;
  goalSummary: string;
  strategyType: string;
  strategyName: string;
  description: string;
  intendedProfile: string;
  expectedOutcome: string;
  estimatedTotalEffort: string;
  tradeOffs: string;
  assumptions: unknown;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  milestones: Array<{
    id: string;
    roadmapId: string;
    position: number;
    title: string;
    shortDescription: string;
    actionableInstructions: string;
    completionCriterion: string;
    estimatedEffort: string;
    iconCategory: string;
    resourceSuggestions: unknown;
    completedAt: Date | null;
  }>;
  achievement: {
    id: string;
    roadmapId: string;
    title: string;
    badgeLabel: string;
    constellationTheme: string;
    featured: boolean;
    earnedAt: Date;
  } | null;
}): PersistedRoadmap {
  const ordered = [...roadmap.milestones].sort((a, b) => a.position - b.position);
  const earliestIncomplete = ordered.find((m) => m.completedAt === null) ?? null;
  const progressCount = ordered.filter((m) => m.completedAt !== null).length;

  return {
    id: roadmap.id,
    title: roadmap.title,
    goalSummary: roadmap.goalSummary,
    strategyType: roadmap.strategyType as StrategyType,
    strategyName: roadmap.strategyName,
    description: roadmap.description,
    intendedProfile: roadmap.intendedProfile,
    expectedOutcome: roadmap.expectedOutcome,
    estimatedTotalEffort: roadmap.estimatedTotalEffort,
    tradeOffs: roadmap.tradeOffs,
    assumptions: Array.isArray(roadmap.assumptions) ? (roadmap.assumptions as string[]) : [],
    archived: roadmap.archived,
    createdAt: roadmap.createdAt.toISOString(),
    updatedAt: roadmap.updatedAt.toISOString(),
    completedAt: roadmap.completedAt ? roadmap.completedAt.toISOString() : null,
    milestones: ordered.map((m) => ({
      id: m.id,
      roadmapId: m.roadmapId,
      position: m.position,
      title: m.title,
      shortDescription: m.shortDescription,
      actionableInstructions: m.actionableInstructions,
      completionCriterion: m.completionCriterion,
      estimatedEffort: m.estimatedEffort,
      iconCategory: normalizeIconCategory(m.iconCategory),
      resourceSuggestions: Array.isArray(m.resourceSuggestions)
        ? (m.resourceSuggestions as ResourceSuggestion[])
        : [],
      completedAt: m.completedAt ? m.completedAt.toISOString() : null
    })),
    activeMilestoneId: earliestIncomplete ? earliestIncomplete.id : null,
    progressCount,
    totalCount: ordered.length,
    achievement: roadmap.achievement
      ? {
        id: roadmap.achievement.id,
        roadmapId: roadmap.achievement.roadmapId,
        title: roadmap.achievement.title,
        badgeLabel: roadmap.achievement.badgeLabel,
        constellationTheme: roadmap.achievement.constellationTheme,
        featured: roadmap.achievement.featured,
        earnedAt: roadmap.achievement.earnedAt.toISOString()
      }
      : null
  };
}

export async function completeMilestoneSequential(params: {
  sessionId: string;
  roadmapId: string;
  stepId: string;
}): Promise<{
  roadmap: PersistedRoadmap;
  motivationalMessage: string;
  newlyEarnedAchievement: PersistedAchievement | null;
}> {
  return prisma.$transaction(async (tx) => {
    const roadmap = await tx.roadmap.findFirst({
      where: { id: params.roadmapId, sessionId: params.sessionId },
      include: {
        milestones: { orderBy: { position: 'asc' } },
        achievement: true
      }
    });

    if (!roadmap) {
      throw new AppError(404, 'ROADMAP_NOT_FOUND', 'Roadmap not found in your workspace.');
    }

    const targetStep = roadmap.milestones.find((m) => m.id === params.stepId);
    if (!targetStep) {
      throw new AppError(404, 'MILESTONE_NOT_FOUND', 'Milestone not found in this roadmap.');
    }

    // Idempotent handling if the step was already completed
    if (targetStep.completedAt !== null) {
      const formatted = formatRoadmapRecord(roadmap);
      return {
        roadmap: formatted,
        motivationalMessage: pickMotivationalMessage(formatted.progressCount),
        newlyEarnedAchievement: null
      };
    }

    const earliestIncomplete = roadmap.milestones.find((m) => m.completedAt === null);
    if (!earliestIncomplete || earliestIncomplete.id !== targetStep.id) {
      throw new AppError(409, 'MILESTONE_LOCKED_OUT_OF_ORDER', BRAND_CONFIG.lockedCheckpointMessage);
    }

    const now = new Date();
    await tx.milestone.update({
      where: { id: targetStep.id },
      data: { completedAt: now }
    });

    const remainingIncomplete = roadmap.milestones.filter(
      (m) => m.id !== targetStep.id && m.completedAt === null
    );
    const isNowFullyComplete = remainingIncomplete.length === 0;

    let newlyEarnedAchievement: PersistedAchievement | null = null;

    if (isNowFullyComplete) {
      await tx.roadmap.update({
        where: { id: roadmap.id },
        data: { completedAt: now }
      });

      if (!roadmap.achievement) {
        const existingAchievementsCount = await tx.achievement.count({
          where: { sessionId: params.sessionId }
        });
        const theme =
          CONSTELLATION_THEMES[existingAchievementsCount % CONSTELLATION_THEMES.length] ?? 'Orion';

        const createdAchievement = await tx.achievement.create({
          data: {
            sessionId: params.sessionId,
            roadmapId: roadmap.id,
            title: `PROJECT COMPLETE — ${roadmap.title}`,
            badgeLabel: `${roadmap.strategyName} Explorer`,
            constellationTheme: theme,
            featured: existingAchievementsCount === 0
          }
        });

        newlyEarnedAchievement = {
          id: createdAchievement.id,
          roadmapId: createdAchievement.roadmapId,
          title: createdAchievement.title,
          badgeLabel: createdAchievement.badgeLabel,
          constellationTheme: createdAchievement.constellationTheme,
          featured: createdAchievement.featured,
          earnedAt: createdAchievement.earnedAt.toISOString()
        };
      }
    }

    const updatedRoadmap = await tx.roadmap.findUniqueOrThrow({
      where: { id: roadmap.id },
      include: {
        milestones: { orderBy: { position: 'asc' } },
        achievement: true
      }
    });

    const formatted = formatRoadmapRecord(updatedRoadmap);
    return {
      roadmap: formatted,
      motivationalMessage: pickMotivationalMessage(formatted.progressCount),
      newlyEarnedAchievement
    };
  });
}

export async function undoLatestMilestoneCompletion(params: {
  sessionId: string;
  roadmapId: string;
  stepId: string;
}): Promise<{ roadmap: PersistedRoadmap }> {
  return prisma.$transaction(async (tx) => {
    const roadmap = await tx.roadmap.findFirst({
      where: { id: params.roadmapId, sessionId: params.sessionId },
      include: {
        milestones: { orderBy: { position: 'asc' } },
        achievement: true
      }
    });

    if (!roadmap) {
      throw new AppError(404, 'ROADMAP_NOT_FOUND', 'Roadmap not found in your workspace.');
    }

    const completedMilestones = roadmap.milestones.filter((m) => m.completedAt !== null);
    const mostRecentCompleted = completedMilestones[completedMilestones.length - 1];

    if (!mostRecentCompleted) {
      throw new AppError(400, 'NOTHING_TO_UNDO', 'No completed milestones to undo.');
    }

    if (mostRecentCompleted.id !== params.stepId) {
      throw new AppError(
        409,
        'UNDO_ORDER_VIOLATION',
        'Only the most recently completed milestone can be undone so sequential progress stays valid.'
      );
    }

    await tx.milestone.update({
      where: { id: mostRecentCompleted.id },
      data: { completedAt: null }
    });

    if (roadmap.completedAt !== null) {
      await tx.roadmap.update({
        where: { id: roadmap.id },
        data: { completedAt: null }
      });
    }

    if (roadmap.achievement) {
      await tx.achievement.delete({
        where: { id: roadmap.achievement.id }
      });
    }

    const updated = await tx.roadmap.findUniqueOrThrow({
      where: { id: roadmap.id },
      include: {
        milestones: { orderBy: { position: 'asc' } },
        achievement: true
      }
    });

    return { roadmap: formatRoadmapRecord(updated) };
  });
}

export async function updateRoadmapWithProgressGuard(params: {
  sessionId: string;
  roadmapId: string;
  payload: UpdateRoadmapRequest;
}): Promise<PersistedRoadmap> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.roadmap.findFirst({
      where: { id: params.roadmapId, sessionId: params.sessionId },
      include: {
        milestones: { orderBy: { position: 'asc' } },
        achievement: true
      }
    });

    if (!existing) {
      throw new AppError(404, 'ROADMAP_NOT_FOUND', 'Roadmap not found in your workspace.');
    }

    if (params.payload.milestones) {
      const completedPrefix = existing.milestones.filter((m) => m.completedAt !== null);

      if (params.payload.milestones.length < completedPrefix.length) {
        throw new AppError(
          409,
          'INVALID_SEQUENCE_EDIT',
          'Cannot remove already-completed milestones from the sequence.'
        );
      }

      for (let i = 0; i < completedPrefix.length; i++) {
        const completedStep = completedPrefix[i]!;
        const incomingStep = params.payload.milestones[i];
        if (!incomingStep || incomingStep.id !== completedStep.id) {
          throw new AppError(
            409,
            'INVALID_SEQUENCE_EDIT',
            'Completed milestones must remain in their original sequential positions.'
          );
        }
      }

      // Update completed steps' editable text metadata & rebuild unfinished steps
      for (let i = 0; i < completedPrefix.length; i++) {
        const incoming = params.payload.milestones[i]!;
        await tx.milestone.update({
          where: { id: completedPrefix[i]!.id },
          data: {
            title: incoming.title,
            shortDescription: incoming.shortDescription,
            actionableInstructions: incoming.actionableInstructions,
            completionCriterion: incoming.completionCriterion,
            estimatedEffort: incoming.estimatedEffort,
            iconCategory: incoming.iconCategory,
            resourceSuggestions: incoming.resourceSuggestions
          }
        });
      }

      await tx.milestone.deleteMany({
        where: {
          roadmapId: existing.id,
          completedAt: null
        }
      });

      const unfinishedIncoming = params.payload.milestones.slice(completedPrefix.length);
      for (let idx = 0; idx < unfinishedIncoming.length; idx++) {
        const item = unfinishedIncoming[idx]!;
        await tx.milestone.create({
          data: {
            roadmapId: existing.id,
            position: completedPrefix.length + idx,
            title: item.title,
            shortDescription: item.shortDescription,
            actionableInstructions: item.actionableInstructions,
            completionCriterion: item.completionCriterion,
            estimatedEffort: item.estimatedEffort,
            iconCategory: item.iconCategory,
            resourceSuggestions: item.resourceSuggestions
          }
        });
      }

      if (unfinishedIncoming.length > 0 && existing.completedAt !== null) {
        await tx.roadmap.update({
          where: { id: existing.id },
          data: { completedAt: null }
        });
      }
    }

    await tx.roadmap.update({
      where: { id: existing.id },
      data: {
        ...(params.payload.title !== undefined ? { title: params.payload.title } : {}),
        ...(params.payload.description !== undefined
          ? { description: params.payload.description }
          : {}),
        ...(params.payload.estimatedTotalEffort !== undefined
          ? { estimatedTotalEffort: params.payload.estimatedTotalEffort }
          : {}),
        ...(params.payload.archived !== undefined ? { archived: params.payload.archived } : {})
      }
    });

    const refreshed = await tx.roadmap.findUniqueOrThrow({
      where: { id: existing.id },
      include: {
        milestones: { orderBy: { position: 'asc' } },
        achievement: true
      }
    });

    return formatRoadmapRecord(refreshed);
  });
}