import { z } from 'zod';

export const STEP_ICON_CATEGORIES = [
    'learn',
    'plan',
    'research',
    'design',
    'build',
    'code',
    'test',
    'debug',
    'deploy',
    'document',
    'publish',
    'review',
    'practice',
    'complete'
] as const;

export const StepIconCategorySchema = z.enum(STEP_ICON_CATEGORIES);
export type StepIconCategory = z.infer<typeof StepIconCategorySchema>;

export const STEP_CATEGORY_LABELS: Record<StepIconCategory, string> = {
    learn: 'Learn & Study',
    plan: 'Plan & Scope',
    research: 'Research & Explore',
    design: 'Design & Architect',
    build: 'Build & Assemble',
    code: 'Code & Implement',
    test: 'Test & Verify',
    debug: 'Debug & Refine',
    deploy: 'Deploy & Ship',
    document: 'Document & Note',
    publish: 'Publish & Share',
    review: 'Review & Audit',
    practice: 'Practice & Drill',
    complete: 'Final Milestone'
};

export function normalizeIconCategory(input: string | undefined | null): StepIconCategory {
    if (!input) return 'build';
    const normalized = input.trim().toLowerCase();
    if ((STEP_ICON_CATEGORIES as readonly string[]).includes(normalized)) {
        return normalized as StepIconCategory;
    }
    return 'build';
}