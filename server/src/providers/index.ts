import type { AppEnv } from '../config/env.js';
import { GeminiRoadmapProvider } from './geminiProvider.js';
import { MockRoadmapProvider } from './mockProvider.js';
import type { RoadmapAiProvider } from './types.js';

export function getAiProvider(currentEnv: AppEnv): RoadmapAiProvider {
    if (currentEnv.AI_PROVIDER === 'gemini') {
        return new GeminiRoadmapProvider(currentEnv);
    }
    return new MockRoadmapProvider();
}