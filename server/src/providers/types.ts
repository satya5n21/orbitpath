import type { FourVariantsResponse, GoalGenerationInput } from '@orbitpath/shared';

export interface RoadmapAiProvider {
    readonly providerName: 'mock' | 'gemini';
    generateVariants(input: GoalGenerationInput): Promise<FourVariantsResponse>;
}