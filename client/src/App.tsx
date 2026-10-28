import React, { useCallback, useEffect, useState } from 'react';
import type {
  CreateRoadmapRequest,
  GoalGenerationInput,
  PersistedAchievement,
  PersistedRoadmap,
  QuotaStatus,
  RoadmapVariant
} from '@orbitpath/shared';
import { orbitApi } from './lib/api.js';
import { StarfieldBackground } from './components/StarfieldBackground.js';
import { Navbar, type ScreenName } from './components/Navbar.js';
import { LandingScreen } from './components/LandingScreen.js';
import { GoalFormScreen } from './components/GoalFormScreen.js';
import { VariantsScreen } from './components/VariantsScreen.js';
import {
  CustomEditorModal,
  type EditableMilestoneItem
} from './components/CustomEditorModal.js';
import { JourneyScreen } from './components/JourneyScreen.js';
import { AchievementModal } from './components/AchievementModal.js';
import { ProfileScreen } from './components/ProfileScreen.js';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>('landing');
  const [aiProvider, setAiProvider] = useState<'mock' | 'gemini'>('mock');
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [roadmaps, setRoadmaps] = useState<PersistedRoadmap[]>([]);
  const [achievements, setAchievements] = useState<PersistedAchievement[]>([]);
  const [featuredAchievement, setFeaturedAchievement] =
    useState<PersistedAchievement | null>(null);
  const [totalCompletedMilestones, setTotalCompletedMilestones] = useState(0);

  // Goal & generation state
  const [draftGoalText, setDraftGoalText] = useState('');
  const [prefillSample, setPrefillSample] = useState(false);
  const [lastGoalInput, setLastGoalInput] = useState<GoalGenerationInput | null>(null);
  const [variants, setVariants] = useState<RoadmapVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active roadmap journey state
  const [activeRoadmap, setActiveRoadmap] = useState<PersistedRoadmap | null>(null);
  const [busyStepId, setBusyStepId] = useState<string | null>(null);
  const [motivationalBanner, setMotivationalBanner] = useState<string | null>(null);
  const [celebratingAchievement, setCelebratingAchievement] =
    useState<PersistedAchievement | null>(null);

  // Custom editor modal state
  const [editorConfig, setEditorConfig] = useState<{
    open: boolean;
    initialTitle: string;
    initialGoalSummary: string;
    initialDescription: string;
    initialEffort: string;
    initialStrategyType?: CreateRoadmapRequest['strategyType'];
    initialStrategyName?: string;
    initialMilestones: EditableMilestoneItem[];
    existingRoadmap?: PersistedRoadmap | null;
  } | null>(null);
  const [isSavingRoadmap, setIsSavingRoadmap] = useState(false);

  const refreshProfileData = useCallback(async () => {
    try {
      const { profile } = await orbitApi.getProfile();
      setRoadmaps(profile.roadmaps);
      setAchievements(profile.achievements);
      setFeaturedAchievement(profile.featuredAchievement);
      setTotalCompletedMilestones(profile.totalCompletedMilestones);
      setQuota(profile.quota);
      setAiProvider(profile.quota.aiProvider);
      setActiveRoadmap((current) => {
        if (!current) return profile.roadmaps.find((r) => !r.archived) ?? null;
        return profile.roadmaps.find((r) => r.id === current.id) ?? current;
      });
    } catch {
      // Non-blocking on initial load if DB is still warming up
    }
  }, []);

  useEffect(() => {
    void refreshProfileData();
  }, [refreshProfileData]);

  const handleStartWithGoal = (initialGoal: string, useSample = false) => {
    setDraftGoalText(initialGoal);
    setPrefillSample(useSample);
    setGenerationError(null);
    setScreen('goal-form');
  };

  const handleGenerateVariants = async (input: GoalGenerationInput) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await orbitApi.generateVariants(input);
      setLastGoalInput(response.goalInput);
      setVariants(response.variants);
      setAiProvider(response.provider);
      setQuota(response.quota);
      setScreen('variants');
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : 'Failed to generate roadmap strategies.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = async (variant: RoadmapVariant) => {
    if (!lastGoalInput) return;
    setIsSavingRoadmap(true);
    try {
      const { roadmap } = await orbitApi.createRoadmap({
        title: `${variant.displayName}: ${lastGoalInput.goal.slice(0, 80)}`,
        goalSummary: lastGoalInput.goal,
        strategyType: variant.strategyType,
        strategyName: variant.displayName,
        description: variant.description,
        intendedProfile: variant.intendedProfile,
        expectedOutcome: variant.expectedOutcome,
        estimatedTotalEffort: variant.estimatedTotalEffort,
        tradeOffs: variant.tradeOffs,
        assumptions: variant.assumptions,
        milestones: variant.milestones
      });
      setActiveRoadmap(roadmap);
      setMotivationalBanner(null);
      await refreshProfileData();
      setScreen('journey');
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Failed to save roadmap.');
    } finally {
      setIsSavingRoadmap(false);
    }
  };

  const handleOpenManualBuilder = (goalText: string) => {
    setEditorConfig({
      open: true,
      initialTitle: goalText ? `Roadmap: ${goalText.slice(0, 70)}` : 'My Custom Mission Roadmap',
      initialGoalSummary: goalText || 'Custom personal mission roadmap',
      initialDescription: 'Custom step-by-step trajectory designed for focused execution.',
      initialEffort: '2–4 weeks',
      initialStrategyType: 'CUSTOM',
      initialStrategyName: 'Custom Path',
      initialMilestones: [],
      existingRoadmap: null
    });
  };

  const handleCustomizeVariant = (variant: RoadmapVariant) => {
    setEditorConfig({
      open: true,
      initialTitle: `${variant.displayName}: ${(lastGoalInput?.goal ?? '').slice(0, 70)}`,
      initialGoalSummary: lastGoalInput?.goal ?? variant.description,
      initialDescription: variant.description,
      initialEffort: variant.estimatedTotalEffort,
      initialStrategyType: variant.strategyType,
      initialStrategyName: variant.displayName,
      initialMilestones: variant.milestones.map((m) => ({
        title: m.title,
        shortDescription: m.shortDescription,
        actionableInstructions: m.actionableInstructions,
        completionCriterion: m.completionCriterion,
        estimatedEffort: m.estimatedEffort,
        iconCategory: m.iconCategory
      })),
      existingRoadmap: null
    });
  };

  const handleOpenExistingRoadmapEditor = () => {
    if (!activeRoadmap) return;
    setEditorConfig({
      open: true,
      initialTitle: activeRoadmap.title,
      initialGoalSummary: activeRoadmap.goalSummary,
      initialDescription: activeRoadmap.description,
      initialEffort: activeRoadmap.estimatedTotalEffort,
      initialStrategyType: activeRoadmap.strategyType,
      initialStrategyName: activeRoadmap.strategyName,
      initialMilestones: activeRoadmap.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        shortDescription: m.shortDescription,
        actionableInstructions: m.actionableInstructions,
        completionCriterion: m.completionCriterion,
        estimatedEffort: m.estimatedEffort,
        iconCategory: m.iconCategory,
        completedAt: m.completedAt
      })),
      existingRoadmap: activeRoadmap
    });
  };

  const handleSaveNewFromEditor = async (payload: CreateRoadmapRequest) => {
    setIsSavingRoadmap(true);
    try {
      const { roadmap } = await orbitApi.createRoadmap(payload);
      setActiveRoadmap(roadmap);
      setEditorConfig(null);
      await refreshProfileData();
      setScreen('journey');
    } finally {
      setIsSavingRoadmap(false);
    }
  };

  const handleSaveExistingFromEditor = async (
    roadmapId: string,
    payload: {
      title: string;
      description: string;
      estimatedTotalEffort: string;
      milestones: EditableMilestoneItem[];
    }
  ) => {
    setIsSavingRoadmap(true);
    try {
      const { roadmap } = await orbitApi.updateRoadmap(roadmapId, {
        title: payload.title,
        description: payload.description,
        estimatedTotalEffort: payload.estimatedTotalEffort,
        milestones: payload.milestones.map((m) => ({
          ...(m.id ? { id: m.id } : {}),
          title: m.title,
          shortDescription: m.shortDescription,
          actionableInstructions: m.actionableInstructions,
          completionCriterion: m.completionCriterion,
          estimatedEffort: m.estimatedEffort,
          iconCategory: m.iconCategory,
          resourceSuggestions: []
        }))
      });
      setActiveRoadmap(roadmap);
      setEditorConfig(null);
      await refreshProfileData();
    } finally {
      setIsSavingRoadmap(false);
    }
  };

  const handleCompleteStep = async (stepId: string) => {
    if (!activeRoadmap || busyStepId) return;
    setBusyStepId(stepId);
    try {
      const res = await orbitApi.completeStep(activeRoadmap.id, stepId);
      setActiveRoadmap(res.roadmap);
      setMotivationalBanner(res.motivationalMessage);
      if (res.newlyEarnedAchievement) {
        setCelebratingAchievement(res.newlyEarnedAchievement);
      }
      await refreshProfileData();
    } catch (err) {
      setMotivationalBanner(
        err instanceof Error ? err.message : 'Could not complete milestone.'
      );
    } finally {
      setBusyStepId(null);
    }
  };

  const handleUndoStep = async (stepId: string) => {
    if (!activeRoadmap || busyStepId) return;
    setBusyStepId(stepId);
    try {
      const res = await orbitApi.undoStep(activeRoadmap.id, stepId);
      setActiveRoadmap(res.roadmap);
      setMotivationalBanner('Most recent checkpoint completion undone.');
      await refreshProfileData();
    } finally {
      setBusyStepId(null);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <StarfieldBackground />

      <Navbar
        currentScreen={screen}
        onNavigate={setScreen}
        aiProvider={aiProvider}
        quota={quota}
        featuredAchievement={featuredAchievement}
        hasActiveRoadmap={Boolean(activeRoadmap)}
      />

      <main className="relative z-10 flex-1">
        {screen === 'landing' && (
          <LandingScreen
            aiProvider={aiProvider}
            savedRoadmaps={roadmaps.filter((r) => !r.archived)}
            onStartWithGoal={handleStartWithGoal}
            onOpenManualBuilder={handleOpenManualBuilder}
            onOpenExistingRoadmap={(roadmap) => {
              setActiveRoadmap(roadmap);
              setScreen('journey');
            }}
          />
        )}

        {screen === 'goal-form' && (
          <GoalFormScreen
            initialGoal={draftGoalText}
            prefillSample={prefillSample}
            isGenerating={isGenerating}
            error={generationError}
            onGenerate={handleGenerateVariants}
            onOpenManualEditor={handleOpenManualBuilder}
            onBack={() => setScreen('landing')}
          />
        )}

        {screen === 'variants' && lastGoalInput && (
          <VariantsScreen
            goalInput={lastGoalInput}
            variants={variants}
            provider={aiProvider}
            isSaving={isSavingRoadmap}
            onSelectVariant={handleSelectVariant}
            onCustomizeVariant={handleCustomizeVariant}
            onBuildManual={() => handleOpenManualBuilder(lastGoalInput.goal)}
            onBack={() => setScreen('goal-form')}
          />
        )}

        {screen === 'journey' && activeRoadmap && (
          <JourneyScreen
            roadmap={activeRoadmap}
            busyStepId={busyStepId}
            motivationalBanner={motivationalBanner}
            onCompleteStep={handleCompleteStep}
            onUndoStep={handleUndoStep}
            onOpenEditor={handleOpenExistingRoadmapEditor}
            onViewAchievement={() => {
              if (activeRoadmap.achievement) {
                setCelebratingAchievement(activeRoadmap.achievement);
              }
            }}
          />
        )}

        {screen === 'profile' && (
          <ProfileScreen
            totalCompletedMilestones={totalCompletedMilestones}
            featuredAchievement={featuredAchievement}
            achievements={achievements}
            roadmaps={roadmaps}
            quota={quota}
            onOpenRoadmap={(roadmap) => {
              setActiveRoadmap(roadmap);
              setScreen('journey');
            }}
            onFeatureAchievement={async (achievementId) => {
              await orbitApi.featureAchievement(achievementId);
              await refreshProfileData();
            }}
            onToggleArchiveRoadmap={async (roadmapId, archived) => {
              await orbitApi.updateRoadmap(roadmapId, { archived });
              await refreshProfileData();
            }}
            onDeleteRoadmap={async (roadmapId) => {
              await orbitApi.deleteRoadmap(roadmapId);
              if (activeRoadmap?.id === roadmapId) {
                setActiveRoadmap(null);
              }
              await refreshProfileData();
            }}
          />
        )}
      </main>

      {editorConfig?.open && (
        <CustomEditorModal
          initialTitle={editorConfig.initialTitle}
          initialGoalSummary={editorConfig.initialGoalSummary}
          initialDescription={editorConfig.initialDescription}
          initialEffort={editorConfig.initialEffort}
          initialStrategyType={editorConfig.initialStrategyType}
          initialStrategyName={editorConfig.initialStrategyName}
          initialMilestones={editorConfig.initialMilestones}
          existingRoadmap={editorConfig.existingRoadmap}
          isSaving={isSavingRoadmap}
          onClose={() => setEditorConfig(null)}
          onSaveNew={handleSaveNewFromEditor}
          onSaveExisting={handleSaveExistingFromEditor}
        />
      )}

      {celebratingAchievement && activeRoadmap && (
        <AchievementModal
          achievement={celebratingAchievement}
          roadmap={activeRoadmap}
          onClose={() => setCelebratingAchievement(null)}
          onGoToProfile={() => {
            setCelebratingAchievement(null);
            setScreen('profile');
          }}
        />
      )}
    </div>
  );
};