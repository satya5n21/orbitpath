import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  BRAND_CONFIG,
  STEP_CATEGORY_LABELS,
  type PersistedMilestone,
  type PersistedRoadmap
} from '@orbitpath/shared';
import {
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  Sliders,
  Sparkles,
  Trophy,
  BookOpen
} from 'lucide-react';
import { CategoryIcon } from '../lib/iconMap.js';

interface JourneyScreenProps {
  roadmap: PersistedRoadmap;
  busyStepId: string | null;
  motivationalBanner: string | null;
  onCompleteStep: (stepId: string) => void;
  onUndoStep: (stepId: string) => void;
  onOpenEditor: () => void;
  onViewAchievement: () => void;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({
  roadmap,
  busyStepId,
  motivationalBanner,
  onCompleteStep,
  onUndoStep,
  onOpenEditor,
  onViewAchievement
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedStepId, setSelectedStepId] = useState<string>(
    roadmap.activeMilestoneId ?? roadmap.milestones[0]?.id ?? ''
  );
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  const selectedMilestone: PersistedMilestone | undefined =
    roadmap.milestones.find((m) => m.id === selectedStepId) ??
    roadmap.milestones.find((m) => m.id === roadmap.activeMilestoneId) ??
    roadmap.milestones[0];

  const completedMilestones = roadmap.milestones.filter((m) => m.completedAt !== null);
  const mostRecentCompletedId =
    completedMilestones[completedMilestones.length - 1]?.id ?? null;

  const progressPercentage = Math.round(
    (roadmap.progressCount / Math.max(1, roadmap.totalCount)) * 100
  );

  const triggerLockedToast = () => {
    setLockedToast(BRAND_CONFIG.lockedCheckpointMessage);
    window.setTimeout(() => {
      setLockedToast((current) =>
        current === BRAND_CONFIG.lockedCheckpointMessage ? null : current
      );
    }, 4200);
  };

  const handleActionClick = (milestone: PersistedMilestone) => {
    const isCompleted = milestone.completedAt !== null;
    const isActive = milestone.id === roadmap.activeMilestoneId;
    if (isCompleted) return;
    if (!isActive) {
      triggerLockedToast();
      return;
    }
    onCompleteStep(milestone.id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Mission Telemetry Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B1021]/90 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                {roadmap.strategyName}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                {roadmap.estimatedTotalEffort}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{roadmap.title}</h1>
            <p className="text-sm text-slate-300">{roadmap.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {roadmap.achievement && (
              <button
                type="button"
                onClick={onViewAchievement}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition"
              >
                <Trophy className="h-4 w-4 text-amber-300" />
                <span>View Constellation Badge</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenEditor}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-cyan-400 transition"
            >
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Customize Steps</span>
            </button>
          </div>
        </div>

        {/* Animated Orbital Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
            <span>
              Mission Progress: {roadmap.progressCount} of {roadmap.totalCount} checkpoints completed
            </span>
            <span className="text-cyan-300 font-semibold">{progressPercentage}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500"
              initial={false}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Friendly Locked Checkpoint Toast & Motivational Banner */}
      <AnimatePresence>
        {lockedToast && (
          <motion.div
            key="locked-toast"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-200 shadow-lg"
          >
            <span>{lockedToast}</span>
            <button
              type="button"
              onClick={() => setLockedToast(null)}
              className="ml-4 text-xs underline text-amber-300"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {motivationalBanner && (
          <motion.div
            key="motivational-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200"
          >
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{motivationalBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Journey Layout: Winding Orbital Path + Checkpoint Inspector */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Winding Space Trajectory */}
        <div className="lg:col-span-7 space-y-5 relative">
          {roadmap.milestones.map((milestone, index) => {
            const isCompleted = milestone.completedAt !== null;
            const isActive = milestone.id === roadmap.activeMilestoneId;
            const isLocked = !isCompleted && !isActive;
            const isSelected = selectedMilestone?.id === milestone.id;
            const isLatestCompleted = milestone.id === mostRecentCompletedId;

            // Subtle winding horizontal offset on desktop screens
            const desktopOffsetClass =
              index % 2 === 1 ? 'md:ml-8' : 'md:mr-8';

            return (
              <div key={milestone.id} className={`relative ${desktopOffsetClass}`}>
                {/* Connector line to next checkpoint */}
                {index < roadmap.milestones.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`absolute left-6 top-14 -bottom-6 w-0.5 transition-colors duration-500 ${isCompleted
                        ? 'bg-gradient-to-b from-emerald-400 to-cyan-400'
                        : 'bg-slate-800'
                      }`}
                  />
                )}

                <motion.div
                  layout={!prefersReducedMotion}
                  onClick={() => setSelectedStepId(milestone.id)}
                  className={`group relative flex items-start gap-4 rounded-2xl border p-4 sm:p-5 cursor-pointer transition ${isActive
                      ? 'border-cyan-400/80 bg-[#0D152D] shadow-xl shadow-cyan-500/15'
                      : isCompleted
                        ? 'border-emerald-500/35 bg-[#0A1324]/90 hover:border-emerald-400/60'
                        : 'border-slate-800/90 bg-[#090D1A]/75 opacity-80 hover:opacity-100 hover:border-slate-700'
                    } ${isSelected ? 'ring-2 ring-cyan-400/60' : ''}`}
                >
                  {/* Orbital Node Icon */}
                  <div className="relative shrink-0">
                    {isActive && !prefersReducedMotion && (
                      <motion.span
                        layoutId="active-orbital-pointer"
                        className=" -inset-1.5 rounded-full border-2 border-cyan-400/60 animate-ping pointer-events-none"
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${isCompleted
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : isActive
                            ? 'border-cyan-300 bg-gradient-to-br from-cyan-500/30 to-violet-600/30 text-cyan-200 shadow-lg shadow-cyan-500/30'
                            : 'border-slate-700 bg-slate-900 text-slate-500'
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <CategoryIcon category={milestone.iconCategory} className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* Node Summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${isCompleted
                              ? 'text-emerald-400'
                              : isActive
                                ? 'text-cyan-300'
                                : 'text-slate-500'
                            }`}
                        >
                          Checkpoint 0{index + 1} •{' '}
                          {isCompleted ? 'Completed' : isActive ? 'Current Active' : 'Locked'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{milestone.estimatedEffort}</span>
                    </div>

                    <h3 className="mt-1 text-base sm:text-lg font-semibold text-white">
                      {milestone.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300">
                      {milestone.shortDescription}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                      <span className="text-[11px] text-slate-400">
                        {STEP_CATEGORY_LABELS[milestone.iconCategory]}
                      </span>

                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isLatestCompleted && (
                          <button
                            type="button"
                            disabled={busyStepId === milestone.id}
                            onClick={() => onUndoStep(milestone.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
                            title="Undo accidental completion"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Undo</span>
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            type="button"
                            disabled={busyStepId === milestone.id}
                            onClick={() => handleActionClick(milestone)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${isActive
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:brightness-110'
                                : 'border border-slate-800 bg-slate-900/90 text-slate-400 hover:border-amber-500/40 hover:text-amber-200'
                              }`}
                          >
                            {isLocked ? (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                <span>Locked</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>
                                  {busyStepId === milestone.id
                                    ? 'Completing...'
                                    : 'Complete Checkpoint'}
                                </span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Checkpoint Detail Panel */}
        {selectedMilestone && (
          <aside className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl border border-slate-800 bg-[#0B1021]/95 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  <CategoryIcon category={selectedMilestone.iconCategory} className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Checkpoint 0{selectedMilestone.position + 1} Briefing
                  </span>
                  <h2 className="text-lg font-bold text-white">{selectedMilestone.title}</h2>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Overview
                </h3>
                <p className="mt-1 text-slate-200 leading-relaxed">
                  {selectedMilestone.shortDescription}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Actionable Instructions
                </h3>
                <p className="mt-1.5 text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedMilestone.actionableInstructions}
                </p>
              </div>

              <div className="rounded-xl border border-violet-500/30 bg-violet-950/15 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Completion Criterion
                </h3>
                <p className="mt-1 text-slate-200">{selectedMilestone.completionCriterion}</p>
              </div>

              {selectedMilestone.resourceSuggestions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Suggested Resources
                  </h3>
                  <div className="space-y-2">
                    {selectedMilestone.resourceSuggestions.map((res, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs"
                      >
                        <BookOpen className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-200">{res.title}</p>
                          {res.note && <p className="text-slate-400">{res.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800">
              {selectedMilestone.completedAt ? (
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed on {new Date(selectedMilestone.completedAt).toLocaleDateString()}
                  </span>
                  {selectedMilestone.id === mostRecentCompletedId && (
                    <button
                      type="button"
                      onClick={() => onUndoStep(selectedMilestone.id)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Undo completion
                    </button>
                  )}
                </div>
              ) : selectedMilestone.id === roadmap.activeMilestoneId ? (
                <button
                  type="button"
                  disabled={busyStepId === selectedMilestone.id}
                  onClick={() => onCompleteStep(selectedMilestone.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {busyStepId === selectedMilestone.id
                      ? 'Saving Progress...'
                      : 'Mark Checkpoint Complete'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={triggerLockedToast}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-medium text-slate-400 hover:border-amber-400/50 hover:text-amber-200 transition"
                >
                  <Lock className="h-4 w-4" />
                  <span>Checkpoint Locked — Complete Current Active Step First</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};