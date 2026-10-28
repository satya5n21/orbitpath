import React from 'react';
import {
    BookOpen,
    Compass,
    Search,
    Layers,
    Hammer,
    Code2,
    FlaskConical,
    Bug,
    Rocket,
    FileText,
    Share2,
    ShieldCheck,
    Dumbbell,
    Sparkles,
    type LucideProps
} from 'lucide-react';
import { normalizeIconCategory, type StepIconCategory } from '@orbitpath/shared';

const CATEGORY_ICON_COMPONENTS: Record<StepIconCategory, React.FC<LucideProps>> = {
    learn: BookOpen,
    plan: Compass,
    research: Search,
    design: Layers,
    build: Hammer,
    code: Code2,
    test: FlaskConical,
    debug: Bug,
    deploy: Rocket,
    document: FileText,
    publish: Share2,
    review: ShieldCheck,
    practice: Dumbbell,
    complete: Sparkles
};

export function CategoryIcon({
    category,
    className = 'w-5 h-5'
}: {
    category: string | undefined | null;
    className?: string;
}) {
    const safeKey = normalizeIconCategory(category);
    const IconComponent = CATEGORY_ICON_COMPONENTS[safeKey] ?? Compass;
    return <IconComponent className={className} aria-hidden="true" />;
}