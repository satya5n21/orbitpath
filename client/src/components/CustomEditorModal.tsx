import React, { useState } from 'react';
import {
  QUOTA_CONFIG,
  STEP_CATEGORY_LABELS,
  STEP_ICON_CATEGORIES,
  type CreateRoadmapRequest,
  type PersistedRoadmap,
  type StepIconCategory
} from '@orbitpath/shared';
import { ArrowDown, ArrowUp, Lock, Plus, Trash2, X } from 'lucide-react';
import { CategoryIcon } from '../lib/iconMap.js';

export interface EditableMilestoneItem {
  id?: string;
  title: string;
  shortDescription: string;
  actionableInstructions: string;
  completionCriterion: string;
  estimatedEffort: string;
  iconCategory: StepIconCategory;
  completedAt?: string | null;
}

interface CustomEditorModalProps {
  initialTitle: string;
  initialGoalSummary: string;
  initialDescription: string;
  initialEffort: string;
  initialStrategyType?: CreateRoadmapRequest['strategyType'];
  initialStrategyName?: string;
  initialMilestones: EditableMilestoneItem[];
  existingRoadmap?: PersistedRoadmap | null;
  isSaving: boolean;
  onClose: () => void;
  onSaveNew: (payload: CreateRoadmapRequest) => void;
  onSaveExisting?: (
    roadmapId: string,
    payload: {
      title: string;
      description: string;
      estimatedTotalEffort: string;
      milestones: EditableMilestoneItem[];
    }
  ) => void;
}

export const CustomEditorModal: React.FC<CustomEditorModalProps> = ({
  initialTitle,
  initialGoalSummary,
  initialDescription,
  initialEffort,
  initialStrategyType = 'CUSTOM',
  initialStrategyName = 'Custom Path',
  initialMilestones,
  existingRoadmap,
  isSaving,
  onClose,
  onSaveNew,
  onSaveExisting
}) => {
  const [title, setTitle] = useState(initialTitle || 'My Custom Mission Roadmap');
  const [description, setDescription] = useState(
    initialDescription || 'Custom step-by-step trajectory designed for focused execution.'
  );
  const [estimatedTotalEffort, setEstimatedTotalEffort] = useState(initialEffort || '2–3 weeks');
  const [milestones, setMilestones] = useState<EditableMilestoneItem[]>(
    initialMilestones.length >= 2
      ? initialMilestones
      : [
        {
          title: 'Define Project Scope & Workspace',
          shortDescription: 'Set up the project directory and list 3 concrete deliverables.',
          actionableInstructions:
            'Create the repository, configure baseline tooling, and write down the exact completion target.',
          completionCriterion: 'Repository initialized and scope checklist committed.',
          estimatedEffort: '2 hours',
          iconCategory: 'plan'
        },
        {
          title: 'Build and Verify First Working Slice',
          shortDescription: 'Implement the primary workflow and test it end-to-end.',
          actionableInstructions:
            'Build the core feature from input to output and verify it handles realistic data.',
          completionCriterion: 'Primary workflow runs end-to-end without errors.',
          estimatedEffort: '4 hours',
          iconCategory: 'code'
        }
      ]
  );
  const [error, setError] = useState<string | null>(null);

  const handleUpdateMilestone = (
    index: number,
    field: keyof EditableMilestoneItem,
    value: string
  ) => {
    setMilestones((prev) =>
      prev.map((m, idx) => (idx === index ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMilestone = () => {
    if (milestones.length >= QUOTA_CONFIG.maxMilestonesPerRoadmap) {
      setError(`Maximum of ${QUOTA_CONFIG.maxMilestonesPerRoadmap} milestones reached.`);
      return;
    }
    setError(null);
    setMilestones((prev) => [
      ...prev,
      {
        title: `Milestone ${prev.length + 1}`,
        shortDescription: 'Focused action toward completing the roadmap.',
        actionableInstructions: 'Execute and verify this concrete step before moving forward.',
        completionCriterion: 'Output verified and working as expected.',
        estimatedEffort: '2 hours',
        iconCategory: 'build'
      }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    const target = milestones[index];
    if (target?.completedAt) {
      setError('Completed milestones are locked in history and cannot be removed.');
      return;
    }
    if (milestones.length <= QUOTA_CONFIG.minMilestonesPerRoadmap) {
      setError(`A roadmap requires at least ${QUOTA_CONFIG.minMilestonesPerRoadmap} milestones.`);
      return;
    }
    setError(null);
    setMilestones((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveMilestone = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;
    if (milestones[index]?.completedAt || milestones[targetIndex]?.completedAt) {
      setError('Cannot reorder already-completed milestones.');
      return;
    }
    setError(null);
    setMilestones((prev) => {
      const copy = [...prev];
      const temp = copy[index]!;
      copy[index] = copy[targetIndex]!;
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError('Roadmap title must be at least 3 characters.');
      return;
    }
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i]!;
      if (m.title.trim().length < 3) {
        setError(`Milestone #${i + 1} title must be at least 3 characters.`);
        return;
      }
      if (m.shortDescription.trim().length < 8) {
        setError(`Milestone #${i + 1} short description must be at least 8 characters.`);
        return;
      }
      if (m.actionableInstructions.trim().length < 10) {
        setError(`Milestone #${i + 1} instructions must be at least 10 characters.`);
        return;
      }
      if (m.completionCriterion.trim().length < 6) {
        setError(`Milestone #${i + 1} completion criterion must be at least 6 characters.`);
        return;
      }
    }

    setError(null);
    if (existingRoadmap && onSaveExisting) {
      onSaveExisting(existingRoadmap.id, {
        title: title.trim(),
        description: description.trim(),
        estimatedTotalEffort: estimatedTotalEffort.trim(),
        milestones
      });
      return;
    }

    onSaveNew({
      title: title.trim(),
      goalSummary: (initialGoalSummary || title).trim(),
      strategyType: initialStrategyType,
      strategyName: initialStrategyName,
      description: description.trim(),
      intendedProfile: 'Custom roadmap builder',
      expectedOutcome: 'All custom milestones completed sequentially',
      estimatedTotalEffort: estimatedTotalEffort.trim(),
      tradeOffs: 'Custom sequence tailored to personal schedule',
      assumptions: ['Custom-designed milestones'],
      milestones: milestones.map((m) => ({
        title: m.title.trim(),
        shortDescription: m.shortDescription.trim(),
        actionableInstructions: m.actionableInstructions.trim(),
        completionCriterion: m.completionCriterion.trim(),
        estimatedEffort: m.estimatedEffort.trim(),
        iconCategory: m.iconCategory,
        resourceSuggestions: []
      }))
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-editor-title"
    >
      <div className="my-8 w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#0B1021] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 id="custom-editor-title" className="text-xl font-bold text-white">
              {existingRoadmap ? 'Edit Roadmap Checkpoints' : 'Custom Roadmap Builder'}
            </h2>
            <p className="text-xs text-slate-400">
              Configure between {QUOTA_CONFIG.minMilestonesPerRoadmap} and{' '}
              {QUOTA_CONFIG.maxMilestonesPerRoadmap} sequential checkpoints. Completed steps stay locked in order.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300">Roadmap Title</label>
              <input
                type="text"
                maxLength={140}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">Estimated Total Effort</label>
              <input
                type="text"
                maxLength={80}
                value={estimatedTotalEffort}
                onChange={(e) => setEstimatedTotalEffort(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Strategy Summary</label>
            <input
              type="text"
              maxLength={350}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Sequential Milestones ({milestones.length}/{QUOTA_CONFIG.maxMilestonesPerRoadmap})
              </h3>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/25"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {milestones.map((m, idx) => {
              const isCompleted = Boolean(m.completedAt);
              return (
                <div
                  key={m.id ?? `draft-${idx}`}
                  className={`rounded-xl border p-4 space-y-3 ${isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : 'border-slate-800 bg-slate-950/70'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-cyan-300">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        Checkpoint {idx + 1}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">
                          <Lock className="h-3 w-3" /> Completed (position locked)
                        </span>
                      )}
                    </div>

                    {!isCompleted && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveMilestone(idx, -1)}
                          disabled={idx === 0 || Boolean(milestones[idx - 1]?.completedAt)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMilestone(idx, 1)}
                          disabled={idx === milestones.length - 1}
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="rounded p-1 text-rose-400 hover:bg-rose-950/50"
                          title="Remove milestone"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] text-slate-400">Title</label>
                      <input
                        type="text"
                        maxLength={120}
                        value={m.title}
                        onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-slate-400">Icon Category</label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <CategoryIcon category={m.iconCategory} className="h-4 w-4 text-cyan-400 shrink-0" />
                        <select
                          value={m.iconCategory}
                          onChange={(e) =>
                            handleUpdateMilestone(idx, 'iconCategory', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
                        >
                          {STEP_ICON_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {STEP_CATEGORY_LABELS[cat]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-slate-400">Estimated Effort</label>
                      <input
                        type="text"
                        maxLength={60}
                        value={m.estimatedEffort}
                        onChange={(e) =>
                          handleUpdateMilestone(idx, 'estimatedEffort', e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] text-slate-400">Short Description</label>
                      <input
                        type="text"
                        maxLength={280}
                        value={m.shortDescription}
                        onChange={(e) =>
                          handleUpdateMilestone(idx, 'shortDescription', e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400">Completion Criterion</label>
                      <input
                        type="text"
                        maxLength={300}
                        value={m.completionCriterion}
                        onChange={(e) =>
                          handleUpdateMilestone(idx, 'completionCriterion', e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400">Actionable Instructions</label>
                    <textarea
                      rows={2}
                      maxLength={900}
                      value={m.actionableInstructions}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, 'actionableInstructions', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
            >
              {isSaving ? 'Saving Roadmap...' : 'Save & Launch Journey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};