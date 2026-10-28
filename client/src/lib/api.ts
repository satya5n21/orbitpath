import type {
  CreateRoadmapRequest,
  GoalGenerationInput,
  PersistedAchievement,
  PersistedRoadmap,
  QuotaStatus,
  RoadmapVariant,
  UpdateRoadmapRequest
} from '@orbitpath/shared';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3001/api';

const SESSION_STORAGE_KEY = 'orbitpath_guest_session_id';

export function getOrCreateGuestSessionId(): string {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && /^[a-zA-Z0-9_-]{12,64}$/.test(existing)) {
    return existing;
  }
  const generated = `guest_${crypto.randomUUID().replace(/-/g, '')}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('x-guest-session-id', getOrCreateGuestSessionId());

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers
    });
  } catch {
    throw new Error(
      'Unable to reach the OrbitPath server. Verify the backend and PostgreSQL database are running.'
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    const err = new Error(body.message || `Request failed with status ${response.status}`);
    (err as Error & { code?: string; status?: number }).code = body.error;
    (err as Error & { code?: string; status?: number }).status = response.status;
    throw err;
  }

  return body as T;
}

export const orbitApi = {
  getHealth: () =>
    apiRequest<{ status: string; aiProvider: 'mock' | 'gemini'; database: string }>('/health'),

  generateVariants: (input: GoalGenerationInput) =>
    apiRequest<{
      goalInput: GoalGenerationInput;
      provider: 'mock' | 'gemini';
      variants: RoadmapVariant[];
      quota: QuotaStatus;
    }>('/roadmaps/generate', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  createRoadmap: (payload: CreateRoadmapRequest) =>
    apiRequest<{ roadmap: PersistedRoadmap }>('/roadmaps', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  listRoadmaps: (includeArchived = false) =>
    apiRequest<{ roadmaps: PersistedRoadmap[] }>(
      `/roadmaps?includeArchived=${includeArchived ? 'true' : 'false'}`
    ),

  getRoadmap: (roadmapId: string) =>
    apiRequest<{ roadmap: PersistedRoadmap }>(`/roadmaps/${roadmapId}`),

  updateRoadmap: (roadmapId: string, payload: UpdateRoadmapRequest) =>
    apiRequest<{ roadmap: PersistedRoadmap }>(`/roadmaps/${roadmapId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteRoadmap: (roadmapId: string) =>
    apiRequest<void>(`/roadmaps/${roadmapId}`, {
      method: 'DELETE'
    }),

  completeStep: (roadmapId: string, stepId: string) =>
    apiRequest<{
      roadmap: PersistedRoadmap;
      motivationalMessage: string;
      newlyEarnedAchievement: PersistedAchievement | null;
    }>(`/roadmaps/${roadmapId}/steps/${stepId}/complete`, {
      method: 'POST'
    }),

  undoStep: (roadmapId: string, stepId: string) =>
    apiRequest<{ roadmap: PersistedRoadmap }>(`/roadmaps/${roadmapId}/steps/${stepId}/undo`, {
      method: 'POST'
    }),

  getProfile: () =>
    apiRequest<{
      profile: {
        sessionId: string;
        totalRoadmaps: number;
        completedRoadmapsCount: number;
        totalCompletedMilestones: number;
        featuredAchievement: PersistedAchievement | null;
        achievements: PersistedAchievement[];
        roadmaps: PersistedRoadmap[];
        quota: QuotaStatus;
      };
    }>('/profile'),

  featureAchievement: (achievementId: string) =>
    apiRequest<{ achievements: PersistedAchievement[] }>(
      `/achievements/${achievementId}/feature`,
      { method: 'POST' }
    )
};