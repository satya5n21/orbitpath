import {
  FourVariantsResponseSchema,
  type FourVariantsResponse,
  type GoalGenerationInput
} from '@orbitpath/shared';
import type { RoadmapAiProvider } from './types.js';

interface GoalTopicProfile {
  subject: string;
  artifact: string;
  coreSkill: string;
  validationTarget: string;
  firstTinyAction: string;
}

function analyzeGoalTopic(goal: string): GoalTopicProfile {
  const lower = goal.toLowerCase();

  if (lower.includes('typescript') || lower.includes('express') || lower.includes('node')) {
    return {
      subject: 'TypeScript & Express Service Migration',
      artifact: 'strictly-typed Express API service',
      coreSkill: 'TypeScript strict mode, Zod validation, and typed Express middleware',
      validationTarget: 'zero `any` leaks and passing integration endpoint checks',
      firstTinyAction: 'Install `typescript` and `@types/express` and generate a baseline `tsconfig.json`'
    };
  }

  if (lower.includes('react') || lower.includes('frontend') || lower.includes('portfolio') || lower.includes('web')) {
    return {
      subject: 'Interactive Web Application Build',
      artifact: 'responsive, accessible web application',
      coreSkill: 'component architecture, state management, and responsive layout design',
      validationTarget: 'end-to-end user flow working across mobile and desktop viewports',
      firstTinyAction: 'Sketch the primary screen wireframe and scaffold the project entry point'
    };
  }

  if (lower.includes('rust') || lower.includes('go') || lower.includes('python') || lower.includes('cli')) {
    return {
      subject: 'Systems & CLI Tooling Mastery',
      artifact: 'tested command-line utility with structured subcommands',
      coreSkill: 'idiomatic data modeling, error handling, and automated unit testing',
      validationTarget: 'CLI binary parsing flags cleanly and passing edge-case test suites',
      firstTinyAction: 'Initialize the project workspace and print a parsed CLI argument to stdout'
    };
  }

  // Dynamic extraction for any arbitrary user goal
  const cleaned = goal
    .replace(/^i want to\s+/i, '')
    .replace(/^my goal is to\s+/i, '')
    .replace(/\.$/, '')
    .trim();
  const shortSubject = cleaned.length > 52 ? `${cleaned.slice(0, 49).trim()}...` : cleaned;

  return {
    subject: shortSubject.charAt(0).toUpperCase() + shortSubject.slice(1),
    artifact: `working deliverable for "${shortSubject}"`,
    coreSkill: `core fundamentals and practical execution of ${shortSubject}`,
    validationTarget: `a measurable, verifiable milestone output for ${shortSubject}`,
    firstTinyAction: `Write a 5-bullet scope checklist defining what "done" looks like for ${shortSubject}`
  };
}

export class MockRoadmapProvider implements RoadmapAiProvider {
  public readonly providerName = 'mock' as const;

  public async generateVariants(input: GoalGenerationInput): Promise<FourVariantsResponse> {
    const profile = analyzeGoalTopic(input.goal);
    const hours = input.hoursPerWeek ?? 6;
    const level = input.experienceLevel ?? 'intermediate';
    const deadlineNote = input.targetDeadline
      ? `Target timeline noted as "${input.targetDeadline}".`
      : `Assumes roughly ${hours} hours/week of focused effort.`;
    const constraintNote = input.constraints
      ? `Honors constraint: ${input.constraints}`
      : 'Assumes standard open-source local tooling with zero paid dependencies.';

    const commonAssumptions = [
      deadlineNote,
      `Calibrated for a ${level} starting point.`,
      constraintNote
    ];

    const response: FourVariantsResponse = {
      variants: [
        {
          id: 'variant-balanced-path',
          strategyType: 'BALANCED_PATH',
          displayName: 'Balanced Path',
          description: `A sustainable rhythm combining targeted learning with incremental implementation toward your ${profile.artifact}.`,
          intendedProfile:
            'Builders who want steady, reliable progress without burning out or cutting critical architectural corners.',
          expectedOutcome: `A complete, well-structured ${profile.artifact} backed by practical understanding and verification.`,
          estimatedTotalEffort: `~${Math.max(2, Math.round(24 / hours))}–${Math.max(3, Math.round(32 / hours))} weeks (${hours} hrs/wk estimate)`,
          tradeOffs:
            'Takes slightly longer than a bare-minimum prototype, and skips esoteric edge cases covered in Deep Mastery.',
          assumptions: commonAssumptions,
          milestones: [
            {
              id: 'bal-1',
              title: `Scope & Baseline Setup for ${profile.subject}`,
              shortDescription: 'Define clear acceptance boundaries and initialize a clean workspace.',
              actionableInstructions: `${profile.firstTinyAction}. Document the exact core features you will include and three non-goals you will defer.`,
              completionCriterion: 'Workspace initializes cleanly and a written scope note lists 3 core deliverables.',
              estimatedEffort: '2–3 hours',
              iconCategory: 'plan',
              resourceSuggestions: [
                {
                  title: 'Incremental Project Scoping Guide',
                  type: 'guide',
                  note: 'Keep initial scope under 1 week of core build effort.'
                }
              ]
            },
            {
              id: 'bal-2',
              title: 'Core Foundations & Mental Model',
              shortDescription: `Acquire the essential concepts for ${profile.coreSkill}.`,
              actionableInstructions: `Study the primary patterns needed for ${profile.subject} and build a small isolated sandbox example to verify how the pieces fit together.`,
              completionCriterion: 'A standalone sandbox example runs without errors and demonstrates the core pattern.',
              estimatedEffort: '4–5 hours',
              iconCategory: 'learn',
              resourceSuggestions: [
                {
                  title: 'Official Reference Documentation',
                  type: 'docs',
                  note: 'Focus on core data flow before advanced configuration.'
                }
              ]
            },
            {
              id: 'bal-3',
              title: 'Vertical Slice Implementation',
              shortDescription: `Build the first end-to-end working vertical slice of your ${profile.artifact}.`,
              actionableInstructions:
                'Implement one complete workflow from input to output rather than building every layer partially.',
              completionCriterion: 'One primary user action or workflow executes from start to finish with valid data.',
              estimatedEffort: '5–6 hours',
              iconCategory: 'code',
              resourceSuggestions: []
            },
            {
              id: 'bal-4',
              title: 'Expand Core Capabilities & Validation',
              shortDescription: 'Complete the remaining essential features and enforce input validation.',
              actionableInstructions:
                'Add the remaining planned capabilities and guard boundary inputs against malformed states or unexpected failures.',
              completionCriterion: 'All scoped workflows operate cleanly and reject invalid inputs predictably.',
              estimatedEffort: '5–6 hours',
              iconCategory: 'build',
              resourceSuggestions: []
            },
            {
              id: 'bal-5',
              title: 'Automated Verification & Edge-Case Audit',
              shortDescription: `Verify ${profile.validationTarget}.`,
              actionableInstructions:
                'Write automated checks for your critical happy paths and top failure modes, then fix any uncovered regressions.',
              completionCriterion: 'All automated checks pass locally with zero unhandled warnings.',
              estimatedEffort: '3–4 hours',
              iconCategory: 'test',
              resourceSuggestions: []
            },
            {
              id: 'bal-6',
              title: 'Documentation & Final Launch',
              shortDescription: 'Package your work with setup instructions and complete a final walkthrough.',
              actionableInstructions:
                'Write a concise README explaining setup, architecture decisions, and usage, then run a clean-room verification pass.',
              completionCriterion: 'Deliverable is documented, reproducible from scratch, and ready to showcase.',
              estimatedEffort: '2–3 hours',
              iconCategory: 'complete',
              resourceSuggestions: []
            }
          ]
        },
        {
          id: 'variant-fast-track',
          strategyType: 'FAST_TRACK',
          displayName: 'Fast Track',
          description: `The shortest sensible route to a working ${profile.artifact}, ruthlessly prioritizing high-leverage execution.`,
          intendedProfile:
            'Action-oriented builders on a tight schedule who learn best by shipping a working slice immediately.',
          expectedOutcome: `A functional, shippable v1 of your ${profile.artifact} in minimal calendar time.`,
          estimatedTotalEffort: `~${Math.max(1, Math.round(12 / hours))}–${Math.max(2, Math.round(16 / hours))} weeks (${hours} hrs/wk estimate)`,
          tradeOffs:
            'Defers deep theoretical detours and secondary polish in favor of immediate end-to-end functionality.',
          assumptions: commonAssumptions,
          milestones: [
            {
              id: 'fast-1',
              title: 'Zero-Friction Bootstrap',
              shortDescription: 'Initialize the working environment and cut every non-essential requirement.',
              actionableInstructions: `${profile.firstTinyAction}. Strip scope down to the single highest-value workflow needed to prove the project works.`,
              completionCriterion: 'Project builds and runs a minimal health check in under 90 minutes.',
              estimatedEffort: '1.5 hours',
              iconCategory: 'plan',
              resourceSuggestions: []
            },
            {
              id: 'fast-2',
              title: 'Core Happy-Path Prototype',
              shortDescription: `Implement the primary functional loop of your ${profile.artifact}.`,
              actionableInstructions:
                'Build the main feature directly using proven defaults. Avoid premature abstractions or custom wrappers.',
              completionCriterion: 'The primary user journey works end-to-end with realistic sample inputs.',
              estimatedEffort: '4–5 hours',
              iconCategory: 'code',
              resourceSuggestions: []
            },
            {
              id: 'fast-3',
              title: 'Smoke Testing & Guardrails',
              shortDescription: 'Add essential input validation and smoke-test the critical path.',
              actionableInstructions: `Verify ${profile.validationTarget} on the main path and add error boundaries for the most likely failure states.`,
              completionCriterion: 'Smoke test suite passes and invalid inputs return clean error messages.',
              estimatedEffort: '3 hours',
              iconCategory: 'test',
              resourceSuggestions: []
            },
            {
              id: 'fast-4',
              title: 'Ship & Verify Live Walkthrough',
              shortDescription: 'Finalize configuration and run a complete production-style check.',
              actionableInstructions:
                'Add a quickstart README and run the full workflow from a clean state to confirm completion.',
              completionCriterion: 'Project runs cleanly from start to finish following the quickstart steps.',
              estimatedEffort: '2 hours',
              iconCategory: 'deploy',
              resourceSuggestions: []
            }
          ]
        },
        {
          id: 'variant-deep-mastery',
          strategyType: 'DEEP_MASTERY',
          displayName: 'Deep Mastery',
          description: `A comprehensive engineering path focused on first principles, architecture, and resilient craftsmanship for ${profile.subject}.`,
          intendedProfile:
            'Learners and engineers who want deep command of the underlying mechanics, edge cases, and long-term maintainability.',
          expectedOutcome: `Production-grade command of ${profile.coreSkill} demonstrated through a thoroughly tested ${profile.artifact}.`,
          estimatedTotalEffort: `~${Math.max(4, Math.round(38 / hours))}–${Math.max(5, Math.round(48 / hours))} weeks (${hours} hrs/wk estimate)`,
          tradeOffs:
            'Requires higher upfront patience and study time before reaching final visual polish.',
          assumptions: commonAssumptions,
          milestones: [
            {
              id: 'deep-1',
              title: 'First-Principles Research & Architecture Spec',
              shortDescription: `Study the underlying mechanics and write an architecture decision record for ${profile.subject}.`,
              actionableInstructions:
                'Investigate how the core technology handles state, errors, and performance under the hood. Write a short Architecture Decision Record (ADR).',
              completionCriterion: 'Written ADR documents data contracts, failure modes, and key trade-offs.',
              estimatedEffort: '4–5 hours',
              iconCategory: 'research',
              resourceSuggestions: []
            },
            {
              id: 'deep-2',
              title: 'Strict Contract & Schema Design',
              shortDescription: 'Design strict data contracts and invariant boundaries before implementation.',
              actionableInstructions:
                'Define explicit schemas, types, and boundary validations so invalid states are unrepresentable at runtime.',
              completionCriterion: 'All domain models and validation schemas compile and pass unit validation checks.',
              estimatedEffort: '5 hours',
              iconCategory: 'design',
              resourceSuggestions: []
            },
            {
              id: 'deep-3',
              title: 'Modular Core Engine Implementation',
              shortDescription: `Build the core domain logic for your ${profile.artifact} with clean separation of concerns.`,
              actionableInstructions:
                'Implement the business logic decoupled from transport or UI layers so every rule can be tested deterministically.',
              completionCriterion: 'Core domain service handles all primary operations independently of UI/HTTP.',
              estimatedEffort: '7–8 hours',
              iconCategory: 'code',
              resourceSuggestions: []
            },
            {
              id: 'deep-4',
              title: 'Integration Layer & Resilience',
              shortDescription: 'Connect persistence, external interfaces, and graceful error recovery.',
              actionableInstructions:
                'Wire the core engine to its persistence and interface layers with transactional safety and timeout handling.',
              completionCriterion: 'End-to-end integration works reliably under both normal and fault-injected scenarios.',
              estimatedEffort: '6–7 hours',
              iconCategory: 'build',
              resourceSuggestions: []
            },
            {
              id: 'deep-5',
              title: 'Comprehensive Test Suite & Edge Cases',
              shortDescription: `Prove ${profile.validationTarget} across unit and integration levels.`,
              actionableInstructions:
                'Write tests covering boundary conditions, concurrency or ordering rules, and malformed payloads.',
              completionCriterion: 'Automated test suite passes 100% including negative and edge-case assertions.',
              estimatedEffort: '5–6 hours',
              iconCategory: 'test',
              resourceSuggestions: []
            },
            {
              id: 'deep-6',
              title: 'Performance Audit, Debugging & Refactoring',
              shortDescription: 'Profile bottlenecks, eliminate technical debt, and harden configuration.',
              actionableInstructions:
                'Review logs, tighten security and environment checks, and refactor any duplicated logic.',
              completionCriterion: 'Zero lint/type warnings and clean performance under repeated execution.',
              estimatedEffort: '4 hours',
              iconCategory: 'review',
              resourceSuggestions: []
            },
            {
              id: 'deep-7',
              title: 'Technical Documentation & Retrospective',
              shortDescription: 'Publish complete architectural documentation and lessons learned.',
              actionableInstructions:
                'Document setup, architecture diagrams, testing strategy, and key engineering takeaways.',
              completionCriterion: 'Complete README and technical retrospective published in the repository.',
              estimatedEffort: '3 hours',
              iconCategory: 'publish',
              resourceSuggestions: []
            }
          ]
        },
        {
          id: 'variant-tiny-steps',
          strategyType: 'TINY_STEPS',
          displayName: 'Tiny Steps',
          description: `Bite-sized, low-friction checkpoints designed to build unstoppable momentum toward ${profile.subject}.`,
          intendedProfile:
            'Anyone feeling overwhelmed by a big goal or fitting progress into busy 30–60 minute daily windows.',
          expectedOutcome: `Steady, stress-free completion of your ${profile.artifact} through small, unmistakable wins.`,
          estimatedTotalEffort: `~${Math.max(2, Math.round(18 / hours))}–${Math.max(3, Math.round(24 / hours))} weeks (in 45–90 min sessions)`,
          tradeOffs:
            'More checkpoints to click through, trading massive single sessions for high psychological momentum.',
          assumptions: commonAssumptions,
          milestones: [
            {
              id: 'tiny-1',
              title: '15-Minute Workspace Ignition',
              shortDescription: 'Create the project folder and write down a 3-sentence goal statement.',
              actionableInstructions: `${profile.firstTinyAction}. Do not worry about perfection—just create the starting file and commit it.`,
              completionCriterion: 'Project directory exists with an initial commit or baseline configuration file.',
              estimatedEffort: '30–45 mins',
              iconCategory: 'plan',
              resourceSuggestions: []
            },
            {
              id: 'tiny-2',
              title: 'Run a Single "Hello World" Slice',
              shortDescription: 'Verify your tools work by running the smallest possible executable example.',
              actionableInstructions:
                'Run one command or render one static view to confirm your environment has zero blockers.',
              completionCriterion: 'Your local environment executes and outputs a visible result without errors.',
              estimatedEffort: '45–60 mins',
              iconCategory: 'practice',
              resourceSuggestions: []
            },
            {
              id: 'tiny-3',
              title: 'Model One Core Data Structure',
              shortDescription: `Define the primary data shape or checklist for ${profile.subject}.`,
              actionableInstructions:
                'Write out the fields or structure for the single most important item in your project.',
              completionCriterion: 'One clean data structure or schema is defined and saved in your project.',
              estimatedEffort: '1 hour',
              iconCategory: 'design',
              resourceSuggestions: []
            },
            {
              id: 'tiny-4',
              title: 'Implement the First Core Action',
              shortDescription: 'Make one concrete feature work from input to output.',
              actionableInstructions:
                'Focus on a single button, route, or function. Ignore secondary features until this one works.',
              completionCriterion: 'One core action produces the expected output when triggered.',
              estimatedEffort: '1.5–2 hours',
              iconCategory: 'code',
              resourceSuggestions: []
            },
            {
              id: 'tiny-5',
              title: 'Connect the Second Building Block',
              shortDescription: `Extend your working slice into a useful ${profile.artifact}.`,
              actionableInstructions:
                'Add persistence, state updates, or the next essential step in the workflow.',
              completionCriterion: 'Two connected steps of your workflow operate together smoothly.',
              estimatedEffort: '1.5–2 hours',
              iconCategory: 'build',
              resourceSuggestions: []
            },
            {
              id: 'tiny-6',
              title: 'Friendly Error & Edge-Case Check',
              shortDescription: 'Test what happens when an input is empty or invalid.',
              actionableInstructions:
                'Try breaking your workflow with an empty input and add a clear, helpful guard condition.',
              completionCriterion: 'Invalid or empty input is handled gracefully without crashing.',
              estimatedEffort: '1 hour',
              iconCategory: 'debug',
              resourceSuggestions: []
            },
            {
              id: 'tiny-7',
              title: 'Write a 5-Line Quickstart & Celebrate',
              shortDescription: 'Jot down how to run your project so future-you can pick it right back up.',
              actionableInstructions:
                'Add a short README note with the exact start command and complete one final walkthrough.',
              completionCriterion: 'README saved and final walkthrough completed from start to finish.',
              estimatedEffort: '45 mins',
              iconCategory: 'complete',
              resourceSuggestions: []
            }
          ]
        }
      ]
    };

    return FourVariantsResponseSchema.parse(response);
  }
}