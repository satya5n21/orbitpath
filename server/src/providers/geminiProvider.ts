import { GoogleGenAI } from '@google/genai';
import {
  FourVariantsResponseSchema,
  STEP_ICON_CATEGORIES,
  type FourVariantsResponse,
  type GoalGenerationInput
} from '@orbitpath/shared';
import { assertGeminiConfigured, type AppEnv } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RoadmapAiProvider } from './types.js';

export class GeminiRoadmapProvider implements RoadmapAiProvider {
  public readonly providerName = 'gemini' as const;
  private readonly envConfig: AppEnv;

  constructor(envConfig: AppEnv) {
    this.envConfig = envConfig;
  }

  public async generateVariants(input: GoalGenerationInput): Promise<FourVariantsResponse> {
    const { apiKey, model } = assertGeminiConfigured(this.envConfig);
    const ai = new GoogleGenAI({ apiKey });

    const prompt = [
      'You are OrbitPath, an expert technical and personal roadmap architect.',
      'Generate exactly FOUR distinct roadmap variants for the user goal below.',
      'The four strategyType values MUST be:',
      '1. BALANCED_PATH (A sustainable balance of learning and execution)',
      '2. FAST_TRACK (The shortest sensible route to a working outcome, prioritizing essential work)',
      '3. DEEP_MASTERY (More emphasis on understanding fundamentals and developing stronger skills)',
      '4. TINY_STEPS (Smaller, less intimidating actions designed to make starting and continuing easier)',
      '',
      'Rules:',
      '- Each variant must have between 4 and 8 milestones.',
      '- Milestones must be concrete, achievable actions, never vague aspirations.',
      `- Every milestone iconCategory MUST be one of: ${STEP_ICON_CATEGORIES.join(', ')}.`,
      '- Include realistic assumptions when information is missing and frame durations clearly as estimates.',
      '- Output strict JSON matching the schema: { "variants": [ ... ] }.',
      '',
      `User Goal: ${input.goal}`,
      input.experienceLevel ? `Experience Level: ${input.experienceLevel}` : '',
      input.hoursPerWeek ? `Hours Available Per Week: ${input.hoursPerWeek}` : '',
      input.targetDeadline ? `Desired Deadline: ${input.targetDeadline}` : '',
      input.constraints ? `Constraints/Budget: ${input.constraints}` : '',
      input.additionalContext ? `Additional Context: ${input.additionalContext}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    const timeoutMs = 28_000;
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(
          new AppError(
            504,
            'GEMINI_TIMEOUT',
            'The AI roadmap generator timed out before completing. Please retry.'
          )
        );
      }, timeoutMs);
    });

    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
            maxOutputTokens: 4096
          }
        }),
        timeoutPromise
      ]);

      const rawText = response.text;
      if (!rawText || !rawText.trim()) {
        throw new AppError(
          502,
          'GEMINI_EMPTY_RESPONSE',
          'The AI model returned an empty response. Please try generating again.'
        );
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        throw new AppError(
          502,
          'GEMINI_INVALID_JSON',
          'The AI model returned malformed JSON. Please retry your request.'
        );
      }

      const validated = FourVariantsResponseSchema.safeParse(parsedJson);
      if (!validated.success) {
        throw new AppError(
          502,
          'GEMINI_SCHEMA_MISMATCH',
          'The AI response did not match the required 4-strategy roadmap structure. Please retry.'
        );
      }

      return validated.data;
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : '';
      if (message.includes('429') || message.toLowerCase().includes('quota')) {
        throw new AppError(
          429,
          'GEMINI_RATE_LIMIT',
          'Upstream Gemini API quota or rate limit reached. Please wait a moment and retry.'
        );
      }
      throw new AppError(
        502,
        'GEMINI_UPSTREAM_FAILURE',
        'Failed to generate roadmap variants from Gemini. Please verify your API configuration or try again.'
      );
    }
  }
}