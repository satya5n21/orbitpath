import React from 'react';
import type {
  PersistedAchievement,
  PersistedRoadmap,
  QuotaStatus
} from '@orbitpath/shared';
import {
  Archive,
  Award,
  CheckCircle2,
  Compass,
  Sparkles,
  Star,
  Trash2
} from 'lucide-react';

interface ProfileScreenProps {
  totalCompletedMilestones: number;
  featuredAchievement: PersistedAchievement | null;
  achievements: PersistedAchievement[];
  roadmaps: PersistedRoadmap[];
  quota: QuotaStatus | null;
  onOpenRoadmap: (roadmap: PersistedRoadmap) => void;
  onFeatureAchievement: (achievementId: string) => void;
  onToggleArchiveRoadmap: (roadmapId: string, archived: boolean) => void;
  onDeleteRoadmap: (roadmapId: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  totalCompletedMilestones,
  featuredAchievement,
  achievements,
  roadmaps,
  quota,
  onOpenRoadmap,
  onFeatureAchievement,
  onToggleArchiveRoadmap,
  onDeleteRoadmap
}) => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-10">
      {/* Explorer Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B1021]/95 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-cyan-400/60 bg-gradient-to-br from-violet-600/30 to-cyan-500/30">
            {featuredAchievement ? (
              <Sparkles className="h-8 w-8 text-amber-300" />
            ) : (
              <Award className="h-8 w-8 text-cyan-300" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Explorer Command Profile
            </span>
            <h1 className="text-2xl font-bold text-white">
              {featuredAchievement
                ? featuredAchievement.title
                : 'Active Space Explorer'}
            </h1>
            <p className="text-xs text-slate-400">
              {featuredAchievement
                ? `Featured Constellation: ${featuredAchievement.constellationTheme} (${featuredAchievement.badgeLabel})`
                : 'Complete all checkpoints on a roadmap to earn your first constellation achievement.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto text-center">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5">
            <p className="text-xl font-bold text-white">{roadmaps.length}</p>
            <p className="text-[11px] text-slate-400">Roadmaps</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5">
            <p className="text-xl font-bold text-cyan-300">{totalCompletedMilestones}</p>
            <p className="text-[11px] text-slate-400">Steps Cleared</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5">
            <p className="text-xl font-bold text-amber-300">{achievements.length}</p>
            <p className="text-[11px] text-slate-400">Achievements</p>
          </div>
        </div>
      </div>

      {/* Earned Project Achievements */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Earned Project Achievements</h2>
          {quota && (
            <span className="text-xs text-slate-400">
              AI Credits Remaining: {quota.remainingToday}/day • {quota.remainingMonth}/month
            </span>
          )}
        </div>

        {achievements.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            No project achievements earned yet. Finish every milestone in a roadmap to unlock your first constellation badge.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`rounded-2xl border p-5 transition ${ach.featured
                    ? 'border-amber-400/60 bg-amber-950/15'
                    : 'border-slate-800 bg-[#0B1021]/90'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    <Star className="h-3.5 w-3.5" />
                    {ach.constellationTheme}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(ach.earnedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-white">{ach.title}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{ach.badgeLabel}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  {ach.featured ? (
                    <span className="text-xs font-semibold text-amber-300">
                      ★ Featured on Profile
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onFeatureAchievement(ach.id)}
                      className="text-xs font-medium text-cyan-300 hover:underline"
                    >
                      Feature this achievement
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Current & Completed Roadmaps */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Your Roadmaps</h2>
        {roadmaps.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            You haven&apos;t saved any roadmaps yet.
          </div>
        ) : (
          <div className="space-y-3">
            {roadmaps.map((roadmap) => {
              const pct = Math.round(
                (roadmap.progressCount / Math.max(1, roadmap.totalCount)) * 100
              );
              return (
                <div
                  key={roadmap.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0B1021]/90 p-5"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                        {roadmap.strategyName}
                      </span>
                      {roadmap.completedAt && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed {new Date(roadmap.completedAt).toLocaleDateString()}
                        </span>
                      )}
                      {roadmap.archived && (
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                          Archived
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{roadmap.title}</h3>
                    <p className="text-xs text-slate-400">
                      {roadmap.progressCount} / {roadmap.totalCount} milestones ({pct}%)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenRoadmap(roadmap)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>Open Journey</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleArchiveRoadmap(roadmap.id, !roadmap.archived)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:text-white"
                      title={roadmap.archived ? 'Unarchive roadmap' : 'Archive roadmap'}
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>{roadmap.archived ? 'Restore' : 'Archive'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRoadmap(roadmap.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40"
                      title="Delete roadmap"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};