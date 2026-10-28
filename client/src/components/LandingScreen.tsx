import React, { useState } from 'react';
import { BRAND_CONFIG, type PersistedRoadmap } from '@orbitpath/shared';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Lock,
  Sparkles,
  Zap,
  Layers,
  Footprints
} from 'lucide-react';

interface LandingScreenProps {
  aiProvider: 'mock' | 'gemini';
  savedRoadmaps: PersistedRoadmap[];
  onStartWithGoal: (initialGoal: string, useSample?: boolean) => void;
  onOpenManualBuilder: (initialGoal: string) => void;
  onOpenExistingRoadmap: (roadmap: PersistedRoadmap) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  aiProvider,
  savedRoadmaps,
  onStartWithGoal,
  onOpenManualBuilder,
  onOpenExistingRoadmap
}) => {
  const [quickGoal, setQuickGoal] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartWithGoal(quickGoal.trim());
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        {/* Hero Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-1 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{BRAND_CONFIG.centralPromise}</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            {BRAND_CONFIG.heroHeadline}
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            {BRAND_CONFIG.heroSubheadline}
          </p>

          {/* Prominent Goal Input Area */}
          <form
            onSubmit={handleQuickSubmit}
            className="rounded-2xl border border-slate-800 bg-[#0B1021]/90 p-3 sm:p-4 shadow-2xl shadow-cyan-950/20"
          >
            <label htmlFor="landing-goal-input" className="sr-only">
              What is your next big goal?
            </label>
            <textarea
              id="landing-goal-input"
              rows={2}
              value={quickGoal}
              onChange={(e) => setQuickGoal(e.target.value)}
              placeholder="e.g., I want to learn TypeScript and migrate one of my existing Express projects."
              className="w-full resize-none rounded-xl bg-slate-950/80 px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 border border-slate-800 focus:border-cyan-400 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStartWithGoal(BRAND_CONFIG.sampleGoal.goal, true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-white transition"
                >
                  <Compass className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{BRAND_CONFIG.demoGoalCtaLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenManualBuilder(quickGoal)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  <span>{BRAND_CONFIG.manualBuildCtaLabel}</span>
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 transition"
              >
                <span>{BRAND_CONFIG.primaryCtaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Four planning approaches note */}
          <div className="space-y-2.5 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Every goal generates 4 tailored strategy paths — or build your own manually:
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { name: 'Balanced Path', note: 'Steady learning + build', icon: Compass },
                { name: 'Fast Track', note: 'Shortest route to v1', icon: Zap },
                { name: 'Deep Mastery', note: 'First-principles depth', icon: Layers },
                { name: 'Tiny Steps', note: 'Low-friction wins', icon: Footprints }
              ].map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-slate-800/90 bg-slate-900/40 p-2.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <item.icon className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{item.name}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {aiProvider === 'mock'
              ? 'Running in local Demo Generation mode — works offline immediately with no API key required.'
              : 'Connected to live Gemini backend generation.'}
          </p>
        </div>

        {/* Interactive Roadmap Preview Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl border border-slate-800 bg-[#0B1021]/90 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                  Interactive Trajectory Preview
                </span>
                <h2 className="text-base font-semibold text-white">
                  TypeScript & Express Migration
                </h2>
              </div>
              <span className="rounded-full border border-violet-500/40 bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-200">
                1 / 3 Complete
              </span>
            </div>

            <div className="mt-6 space-y-5 relative">
              {/* Step 1: Completed */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300">Checkpoint 01 • Done</span>
                    <span className="text-[11px] text-slate-400">2 hrs</span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">
                    Baseline tsconfig.json & Strict Mode Setup
                  </p>
                </div>
              </div>

              {/* Step 2: Active */}
              <div className="flex items-start gap-3.5">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/25 border-2 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-xl border border-cyan-400/50 bg-slate-900/90 p-3.5 shadow-lg shadow-cyan-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-300">
                      Current Checkpoint • Active
                    </span>
                    <span className="text-[11px] text-slate-300">3 hrs</span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Convert 2 Express Routes with Zod Request Schemas
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Criterion: Both endpoints validate payloads and pass integration checks.
                  </p>
                </div>
              </div>

              {/* Step 3: Locked */}
              <div className="flex items-start gap-3.5 opacity-65">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Checkpoint 03 • Locked</span>
                    <span className="text-[11px] text-slate-500">4 hrs</span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-slate-400">
                    Strict Error Middleware & Zero-Any CI Check
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Saved Roadmaps Quick Resume */}
      {savedRoadmaps.length > 0 && (
        <section className="mt-14 border-t border-slate-800/80 pt-8">
          <h2 className="text-lg font-semibold text-white">Continue Your Saved Journeys</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedRoadmaps.slice(0, 3).map((roadmap) => (
              <button
                key={roadmap.id}
                type="button"
                onClick={() => onOpenExistingRoadmap(roadmap)}
                className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0B1021]/90 p-4 text-left hover:border-cyan-500/50 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-cyan-400">{roadmap.strategyName}</span>
                    <span>
                      {roadmap.progressCount}/{roadmap.totalCount} steps
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-semibold text-white group-hover:text-cyan-200 transition">
                    {roadmap.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{roadmap.description}</p>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all"
                    style={{
                      width: `${Math.round((roadmap.progressCount / Math.max(1, roadmap.totalCount)) * 100)}%`
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};