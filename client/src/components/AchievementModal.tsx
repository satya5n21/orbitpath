import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { PersistedAchievement, PersistedRoadmap } from '@orbitpath/shared';
import { Check, Share2, Sparkles, X } from 'lucide-react';

interface AchievementModalProps {
    achievement: PersistedAchievement;
    roadmap: PersistedRoadmap;
    onClose: () => void;
    onGoToProfile: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
    achievement,
    roadmap,
    onClose,
    onGoToProfile
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyShareCard = async () => {
        const shareText = [
            `🌌 ${achievement.title}`,
            `Constellation Badge: ${achievement.constellationTheme} • ${achievement.badgeLabel}`,
            `Completed all ${roadmap.totalCount} sequential checkpoints on OrbitPath!`
        ].join('\n');

        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setCopied(true);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-modal-title"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-lg rounded-3xl border border-cyan-400/40 bg-gradient-to-b from-[#0F172A] to-[#060814] p-7 text-center shadow-2xl shadow-cyan-500/20"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    aria-label="Close achievement modal"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Constellation Emblem */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-300/60 bg-gradient-to-br from-amber-500/20 via-violet-500/20 to-cyan-500/20 shadow-lg shadow-amber-500/20">
                    <svg className="h-14 w-14 text-amber-300" viewBox="0 0 64 64" fill="none">
                        <circle cx="14" cy="46" r="3" fill="currentColor" />
                        <circle cx="28" cy="22" r="3.5" fill="#38BDF8" />
                        <circle cx="48" cy="16" r="4" fill="#FDE047" />
                        <circle cx="50" cy="42" r="3" fill="#C084FC" />
                        <path
                            d="M14 46L28 22L48 16L50 42L28 22"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                        />
                    </svg>
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{achievement.constellationTheme} Constellation Unlocked</span>
                </div>

                <h2 id="achievement-modal-title" className="mt-3 text-2xl font-bold text-white">
                    {achievement.title}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                    All {roadmap.totalCount} checkpoints verified and completed in sequence.
                </p>

                {/* Shareable Completion Card Preview */}
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-cyan-300">{achievement.badgeLabel}</span>
                        <span>{new Date(achievement.earnedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-white">{roadmap.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {roadmap.totalCount}/{roadmap.totalCount} milestones finished on OrbitPath
                    </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={handleCopyShareCard}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25 transition"
                    >
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                        <span>{copied ? 'Completion Card Copied!' : 'Copy Shareable Summary'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onGoToProfile}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110 transition"
                    >
                        <span>View in Profile</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};