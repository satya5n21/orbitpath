import React, { useEffect, useState } from 'react';
import {
  BRAND_CONFIG,
  GoalGenerationInputSchema,
  type ExperienceLevel,
  type GoalGenerationInput
} from '@orbitpath/shared';
import { AlertCircle, ArrowLeft, Compass, Loader2, Sparkles, Wrench } from 'lucide-react';

interface GoalFormScreenProps {
  initialGoal: string;
  prefillSample: boolean;
  isGenerating: boolean;
  error: string | null;
  onGenerate: (input: GoalGenerationInput) => void;
  onOpenManualEditor: (goalText: string) => void;
  onBack: () => void;
}

const LOADING_STAGES = [
  'Analyzing your goal scope and constraints...',
  'Designing Balanced, Fast Track, Deep Mastery, and Tiny Steps trajectories...',
  'Verifying actionable completion criteria for each checkpoint...'
];

export const GoalFormScreen: React.FC<GoalFormScreenProps> = ({
  initialGoal,
  prefillSample,
  isGenerating,
  error,
  onGenerate,
  onOpenManualEditor,
  onBack
}) => {
  const [goal, setGoal] = useState(
    prefillSample ? BRAND_CONFIG.sampleGoal.goal : initialGoal
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(
    prefillSample ? BRAND_CONFIG.sampleGoal.experienceLevel : ''
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<string>(
    prefillSample ? String(BRAND_CONFIG.sampleGoal.hoursPerWeek) : ''
  );
  const [targetDeadline, setTargetDeadline] = useState(
    prefillSample ? BRAND_CONFIG.sampleGoal.targetDeadline : ''
  );
  const [constraints, setConstraints] = useState(
    prefillSample ? BRAND_CONFIG.sampleGoal.constraints : ''
  );
  const [additionalContext, setAdditionalContext] = useState(
    prefillSample ? BRAND_CONFIG.sampleGoal.additionalContext : ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setStageIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const handleFillSample = () => {
    setGoal(BRAND_CONFIG.sampleGoal.goal);
    setExperienceLevel(BRAND_CONFIG.sampleGoal.experienceLevel);
    setHoursPerWeek(String(BRAND_CONFIG.sampleGoal.hoursPerWeek));
    setTargetDeadline(BRAND_CONFIG.sampleGoal.targetDeadline);
    setConstraints(BRAND_CONFIG.sampleGoal.constraints);
    setAdditionalContext(BRAND_CONFIG.sampleGoal.additionalContext);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    const candidate = {
      goal,
      ...(experienceLevel ? { experienceLevel } : {}),
      ...(hoursPerWeek.trim() ? { hoursPerWeek: Number(hoursPerWeek) } : {}),
      ...(targetDeadline.trim() ? { targetDeadline } : {}),
      ...(constraints.trim() ? { constraints } : {}),
      ...(additionalContext.trim() ? { additionalContext } : {})
    };

    const parsed = GoalGenerationInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Please check your goal input.');
      return;
    }

    setValidationError(null);
    onGenerate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        disabled={isGenerating}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to home</span>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Define Your Mission Goal</h1>
          <p className="mt-1 text-sm text-slate-400">
            Describe what you want to accomplish. Optional details help calibrate effort estimates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillSample}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 transition"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Load sample TypeScript goal</span>
        </button>
      </div>

      {(validationError || error) && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <p className="font-medium">{validationError || error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0B1021]/90 p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="goal-textarea" className="block text-sm font-semibold text-white">
              Your Goal <span className="text-cyan-400">*</span>
            </label>
            <textarea
              id="goal-textarea"
              rows={3}
              disabled={isGenerating}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., I want to learn TypeScript and migrate one of my existing Express projects."
              className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>Minimum 8 characters</span>
              <span>{goal.length}/500</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="exp-select" className="block text-xs font-medium text-slate-300">
                Current Experience (Optional)
              </label>
              <select
                id="exp-select"
                disabled={isGenerating}
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | '')}
                className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="">Not specified</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="hours-input" className="block text-xs font-medium text-slate-300">
                Hours / Week (Optional)
              </label>
              <input
                id="hours-input"
                type="number"
                min={1}
                max={80}
                disabled={isGenerating}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                placeholder="e.g., 6"
                className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="deadline-input" className="block text-xs font-medium text-slate-300">
                Desired Deadline (Optional)
              </label>
              <input
                id="deadline-input"
                type="text"
                disabled={isGenerating}
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                placeholder="e.g., 4 weeks"
                className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="constraints-input" className="block text-xs font-medium text-slate-300">
                Budget or Constraints (Optional)
              </label>
              <input
                id="constraints-input"
                type="text"
                disabled={isGenerating}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g., Free open-source tools only"
                className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="context-input" className="block text-xs font-medium text-slate-300">
                Additional Context (Optional)
              </label>
              <input
                id="context-input"
                type="text"
                disabled={isGenerating}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="e.g., Existing Express API with 8 endpoints"
                className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Goal Summary before generation */}
        {goal.trim().length >= 8 && (
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              Mission Summary Preview
            </span>
            <p className="mt-1 text-sm font-medium text-white">{goal.trim()}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-md bg-slate-800/80 px-2 py-0.5">
                Level: {experienceLevel || 'Adaptive'}
              </span>
              <span className="rounded-md bg-slate-800/80 px-2 py-0.5">
                Pace: {hoursPerWeek ? `${hoursPerWeek} hrs/wk` : 'Flexible'}
              </span>
              {targetDeadline && (
                <span className="rounded-md bg-slate-800/80 px-2 py-0.5">
                  Target: {targetDeadline}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading State Indicator (no fake percentages) */}
        {isGenerating && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-5 text-center space-y-3"
          >
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-cyan-400" />
            <p className="text-sm font-medium text-cyan-200">{LOADING_STAGES[stageIndex]}</p>
            <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => onOpenManualEditor(goal.trim())}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 transition disabled:opacity-50"
          >
            <Wrench className="h-4 w-4 text-violet-400" />
            <span>{BRAND_CONFIG.manualBuildCtaLabel} (0 AI credits)</span>
          </button>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isGenerating ? 'Plotting Trajectories...' : 'Generate 4 Strategy Paths'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};