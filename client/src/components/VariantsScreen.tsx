import React from 'react';
import {
  BRAND_CONFIG,
  type GoalGenerationInput,
  type RoadmapVariant
} from '@orbitpath/shared';
import {
  ArrowLeft,
  Check,
  Clock,
  Sliders,
  Sparkles,
  Wrench
} from 'lucide-react';
import { CategoryIcon } from '../lib/iconMap.js';

interface VariantsScreenProps {
  goalInput: GoalGenerationInput;
  variants: RoadmapVariant[];
  provider: 'mock' | 'gemini';
  isSaving: boolean;
  onSelectVariant: (variant: RoadmapVariant) => void;
  onCustomizeVariant: (variant: RoadmapVariant) => void;
  onBuildManual: () => void;
  onBack: () => void;
}

export const VariantsScreen: React.FC<VariantsScreenProps> = ({
  goalInput,
  variants,
  provider,
  isSaving,
  onSelectVariant,
  onCustomizeVariant,
  onBuildManual,
  onBack
}) => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Adjust goal parameters</span>
        </button>

        <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs text-slate-300">
          Generated via {provider === 'gemini' ? 'Live Gemini API' : 'Local Demo Planner'}
        </span>
      </div>

      <div className="mt-4 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Choose Your Mission Trajectory
        </h1>
        <p className="mt-1.5 text-sm text-slate-300">
          Goal: <span className="font-medium text-cyan-300">"{goalInput.goal}"</span>
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {variants.map((variant) => (
          <article
            key={variant.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0B1021]/95 p-6 shadow-xl hover:border-cyan-500/40 transition"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-md bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                    {variant.strategyType.replace('_', ' ')}
                  </span>
                  <h2 className="mt-1.5 text-xl font-bold text-white">{variant.displayName}</h2>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    {variant.estimatedTotalEffort}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {variant.milestones.length} checkpoints (estimate)
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300">{variant.description}</p>

              <div className="grid gap-2.5 rounded-xl border border-slate-800/90 bg-slate-950/60 p-3.5 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Best suited for: </span>
                  <span className="text-slate-400">{variant.intendedProfile}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-200">Expected outcome: </span>
                  <span className="text-slate-400">{variant.expectedOutcome}</span>
                </div>
                <div>
                  <span className="font-semibold text-amber-300/90">Trade-offs: </span>
                  <span className="text-slate-400">{variant.tradeOffs}</span>
                </div>
              </div>

              {/* Assumptions */}
              {variant.assumptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {variant.assumptions.map((assumption, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-[11px] text-slate-400"
                    >
                      {assumption}
                    </span>
                  ))}
                </div>
              )}

              {/* Preview of first 3 milestones */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  First Checkpoints Preview
                </p>
                {variant.milestones.slice(0, 3).map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 px-3 py-2 text-xs"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-cyan-300">
                      <CategoryIcon category={step.iconCategory} className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium text-slate-200 truncate">
                      {idx + 1}. {step.title}
                    </span>
                    <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                      {step.estimatedEffort}
                    </span>
                  </div>
                ))}
                {variant.milestones.length > 3 && (
                  <p className="text-[11px] text-slate-500 pl-2">
                    + {variant.milestones.length - 3} more sequential checkpoints
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onSelectVariant(variant)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>Start This Path</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onCustomizeVariant(variant)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:border-cyan-400 transition disabled:opacity-50"
              >
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Customize</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Manual Creation Option Below */}
      <div className="mt-10 rounded-2xl border border-violet-500/30 bg-violet-950/15 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Full Manual Control</span>
          </div>
          <h3 className="text-lg font-semibold text-white">{BRAND_CONFIG.manualBuildCtaLabel}</h3>
          <p className="text-sm text-slate-300">
            Prefer designing every milestone from scratch? Build your own custom sequence without using AI credits.
          </p>
        </div>
        <button
          type="button"
          onClick={onBuildManual}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-400/50 bg-violet-600/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-600/40 transition shrink-0"
        >
          <Wrench className="h-4 w-4" />
          <span>{BRAND_CONFIG.manualBuildCtaLabel}</span>
        </button>
      </div>
    </div>
  );
};