import { z } from 'zod';
import { StepIconCategorySchema } from './icons.js';
import { QUOTA_CONFIG } from './quotas.js';

export const StrategyTypeSchema = z.enum([
  'BALANCED_PATH',
  'FAST_TRACK',
  'DEEP_MASTERY',
  'TINY_STEPS',
  'CUSTOM'
]);
export type StrategyType = z.infer<typeof StrategyTypeSchema>;

export const AI_STRATEGY_TYPES = [
  'BALANCED_PATH',
  'FAST_TRACK',
  'DEEP_MASTERY',
  'TINY_STEPS'
] as const;
export type AiStrategyType = (typeof AI_STRATEGY_TYPES)[number];

export const ExperienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;

export const GoalGenerationInputSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(8, 'Please describe your goal in at least 8 characters.')
    .max(500, 'Please keep your goal under 500 characters.'),
  experienceLevel: ExperienceLevelSchema.optional(),
  hoursPerWeek: z.coerce.number().min(1).max(80).optional(),
  targetDeadline: z.string().trim().max(120).optional(),
  constraints: z.string().trim().max(300).optional(),
  additionalContext: z.string().trim().max(600).optional()
});
export type GoalGenerationInput = z.infer<typeof GoalGenerationInputSchema>;

export const ResourceSuggestionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  type: z.enum(['docs', 'guide', 'tool', 'practice']),
  note: z.string().trim().max(200).optional()
});
export type ResourceSuggestion = z.infer<typeof ResourceSuggestionSchema>;

export const MilestoneDraftSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(3, 'Milestone title is too short').max(120, 'Milestone title max 120 chars'),
  shortDescription: z
    .string()
    .trim()
    .min(8, 'Description is too short')
    .max(280, 'Short description max 280 chars'),
  actionableInstructions: z
    .string()
    .trim()
    .min(10, 'Instructions must be actionable')
    .max(900, 'Instructions max 900 chars'),
  completionCriterion: z
    .string()
    .trim()
    .min(6, 'Provide a clear completion criterion')
    .max(300, 'Completion criterion max 300 chars'),
  estimatedEffort: z.string().trim().min(2).max(80),
  iconCategory: StepIconCategorySchema,
  resourceSuggestions: z.array(ResourceSuggestionSchema).max(3).default([])
});
export type MilestoneDraft = z.infer<typeof MilestoneDraftSchema>;

export const RoadmapVariantSchema = z.object({
  id: z.string().trim().min(1).max(80),
  strategyType: z.enum(AI_STRATEGY_TYPES),
  displayName: z.string().trim().min(3).max(80),
  description: z.string().trim().min(12).max(350),
  intendedProfile: z.string().trim().min(8).max(240),
  expectedOutcome: z.string().trim().min(8).max(260),
  estimatedTotalEffort: z.string().trim().min(3).max(100),
  tradeOffs: z.string().trim().min(8).max(280),
  assumptions: z.array(z.string().trim().min(4).max(200)).min(1).max(4),
  milestones: z
    .array(MilestoneDraftSchema)
    .min(QUOTA_CONFIG.recommendedMinMilestones)
    .max(QUOTA_CONFIG.maxMilestonesPerRoadmap)
});
export type RoadmapVariant = z.infer<typeof RoadmapVariantSchema>;

export const FourVariantsResponseSchema = z
  .object({
    variants: z.array(RoadmapVariantSchema).length(4)
  })
  .refine(
    (val) => {
      const types = new Set(val.variants.map((v) => v.strategyType));
      return (
        types.size === 4 &&
        types.has('BALANCED_PATH') &&
        types.has('FAST_TRACK') &&
        types.has('DEEP_MASTERY') &&
        types.has('TINY_STEPS')
      );
    },
    {
      message:
        'Must contain exactly four distinct strategy variants: BALANCED_PATH, FAST_TRACK, DEEP_MASTERY, and TINY_STEPS.'
    }
  );
export type FourVariantsResponse = z.infer<typeof FourVariantsResponseSchema>;

export const CreateRoadmapRequestSchema = z.object({
  title: z.string().trim().min(3).max(140),
  goalSummary: z.string().trim().min(8).max(500),
  strategyType: StrategyTypeSchema,
  strategyName: z.string().trim().min(3).max(80),
  description: z.string().trim().min(8).max(400),
  intendedProfile: z.string().trim().max(240).default('Custom planner'),
  expectedOutcome: z.string().trim().max(260).default('Goal completed step by step'),
  estimatedTotalEffort: z.string().trim().min(2).max(100),
  tradeOffs: z.string().trim().max(280).default('Tailored to your custom workflow'),
  assumptions: z.array(z.string().trim().max(200)).max(5).default([]),
  milestones: z
    .array(
      MilestoneDraftSchema.omit({ id: true }).extend({
        id: z.string().optional()
      })
    )
    .min(QUOTA_CONFIG.minMilestonesPerRoadmap)
    .max(QUOTA_CONFIG.maxMilestonesPerRoadmap)
});
export type CreateRoadmapRequest = z.infer<typeof CreateRoadmapRequestSchema>;

export const UpdateRoadmapRequestSchema = z.object({
  title: z.string().trim().min(3).max(140).optional(),
  description: z.string().trim().min(8).max(400).optional(),
  estimatedTotalEffort: z.string().trim().min(2).max(100).optional(),
  archived: z.boolean().optional(),
  milestones: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(3).max(120),
        shortDescription: z.string().trim().min(8).max(280),
        actionableInstructions: z.string().trim().min(10).max(900),
        completionCriterion: z.string().trim().min(6).max(300),
        estimatedEffort: z.string().trim().min(2).max(80),
        iconCategory: StepIconCategorySchema,
        resourceSuggestions: z.array(ResourceSuggestionSchema).max(3).default([])
      })
    )
    .min(QUOTA_CONFIG.minMilestonesPerRoadmap)
    .max(QUOTA_CONFIG.maxMilestonesPerRoadmap)
    .optional()
});
export type UpdateRoadmapRequest = z.infer<typeof UpdateRoadmapRequestSchema>;

export interface PersistedMilestone {
  id: string;
  roadmapId: string;
  position: number;
  title: string;
  shortDescription: string;
  actionableInstructions: string;
  completionCriterion: string;
  estimatedEffort: string;
  iconCategory: z.infer<typeof StepIconCategorySchema>;
  resourceSuggestions: ResourceSuggestion[];
  completedAt: string | null;
}

export interface PersistedAchievement {
  id: string;
  roadmapId: string;
  title: string;
  badgeLabel: string;
  constellationTheme: string;
  featured: boolean;
  earnedAt: string;
}

export interface PersistedRoadmap {
  id: string;
  title: string;
  goalSummary: string;
  strategyType: StrategyType;
  strategyName: string;
  description: string;
  intendedProfile: string;
  expectedOutcome: string;
  estimatedTotalEffort: string;
  tradeOffs: string;
  assumptions: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  milestones: PersistedMilestone[];
  activeMilestoneId: string | null;
  progressCount: number;
  totalCount: number;
  achievement: PersistedAchievement | null;
}

export interface QuotaStatus {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  remainingToday: number;
  remainingMonth: number;
  aiProvider: 'mock' | 'gemini';
}