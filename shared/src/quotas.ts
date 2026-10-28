export const QUOTA_CONFIG = {
    maxGenerationsPerMonth: 5,
    maxGenerationsPerDay: 2,
    variantsPerGeneration: 4,
    deduplicationWindowMs: 15_000,
    minMilestonesPerRoadmap: 2,
    maxMilestonesPerRoadmap: 8,
    recommendedMinMilestones: 4
} as const;