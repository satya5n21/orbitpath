export const BRAND_CONFIG = {
  appName: 'OrbitPath',
  centralPromise: 'Turn your next big goal into small steps you can actually finish.',
  heroHeadline: 'Big goals. Small steps. Real progress.',
  heroSubheadline:
    'Turn your next ambition into a personalized roadmap. Choose your path, complete one checkpoint at a time, and see how far you can go.',
  primaryCtaLabel: 'Build my roadmap',
  demoGoalCtaLabel: 'Explore a sample goal',
  manualBuildCtaLabel: 'Build my own roadmap',
  lockedCheckpointMessage:
    'Easy there, space explorer. 🌌 That checkpoint is still locked. Complete the current one to move forward.',
  sampleGoal: {
    goal: 'I want to learn TypeScript and migrate one of my existing Express projects.',
    experienceLevel: 'intermediate' as const,
    hoursPerWeek: 6,
    targetDeadline: '4 weeks',
    constraints: 'Zero downtime on existing endpoints; keep existing Jest/Vitest tests green.',
    additionalContext: 'Currently running a Node.js + Express REST service with 8 routes and PostgreSQL.'
  }
} as const;