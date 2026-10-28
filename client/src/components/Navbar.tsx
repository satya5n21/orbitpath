import React from 'react';
import { BRAND_CONFIG, type PersistedAchievement, type QuotaStatus } from '@orbitpath/shared';
import { Award, Compass, PlusCircle, Sparkles } from 'lucide-react';

export type ScreenName = 'landing' | 'goal-form' | 'variants' | 'journey' | 'profile';

interface NavbarProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  aiProvider: 'mock' | 'gemini';
  quota: QuotaStatus | null;
  featuredAchievement: PersistedAchievement | null;
  hasActiveRoadmap: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  aiProvider,
  quota,
  featuredAchievement,
  hasActiveRoadmap
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#060814]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
        >
          <svg
            className="h-9 w-9 text-cyan-400 transition-transform duration-300 group-hover:rotate-12"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="4 4" />
            <ellipse cx="20" cy="20" rx="17" ry="8" transform="rotate(-28 20 20)" stroke="#8B5CF6" strokeWidth="1.8" />
            <circle cx="20" cy="20" r="5" fill="url(#orbitCore)" />
            <circle cx="32" cy="13" r="2.6" fill="#06B6D4" />
            <defs>
              <linearGradient id="orbitCore" x1="15" y1="15" x2="25" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">
              {BRAND_CONFIG.appName}
            </span>
            <span className="ml-2.5 inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/90 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              <span
                className={`h-1.5 w-1.5 rounded-full ${aiProvider === 'gemini' ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
              />
              {aiProvider === 'gemini' ? 'Gemini AI' : 'Demo Generation'}
            </span>
          </div>
        </button>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
          <button
            type="button"
            onClick={() => onNavigate('goal-form')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${currentScreen === 'goal-form'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Goal</span>
          </button>

          {hasActiveRoadmap && (
            <button
              type="button"
              onClick={() => onNavigate('journey')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${currentScreen === 'journey'
                  ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
            >
              <Compass className="h-4 w-4" />
              <span>Active Journey</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${currentScreen === 'profile'
                ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
          >
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-cyan-400/40">
              {featuredAchievement ? (
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-label="Featured achievement emblem" />
              ) : (
                <Award className="h-3.5 w-3.5 text-cyan-300" />
              )}
            </div>
            <span className="hidden sm:inline">Profile</span>
            {quota && (
              <span
                title="Remaining daily AI generations"
                className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-400"
              >
                {quota.remainingToday}/{quota.dailyLimit}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};