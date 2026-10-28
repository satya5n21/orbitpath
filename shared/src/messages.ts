export const MOTIVATIONAL_MESSAGES: readonly string[] = [
  'Small progress is still progress.',
  'One checkpoint closer to the finish.',
  'You turned an intention into an action.',
  "The next step doesn't need to be perfect. It needs to happen.",
  "Keep going. You've already started.",
  'Momentum is built one completed node at a time.',
  'Another complex task broken down and cleared.',
  'Steady execution always outpaces distant planning.',
  'Checkpoint secured. Your trajectory is holding steady.',
  'Each finished step reduces the gravity of the whole project.'
] as const;

export function pickMotivationalMessage(completedCount: number): string {
  const index = Math.abs(completedCount) % MOTIVATIONAL_MESSAGES.length;
  return MOTIVATIONAL_MESSAGES[index] ?? 'Small progress is still progress.';
}