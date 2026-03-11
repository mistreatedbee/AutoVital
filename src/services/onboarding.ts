import { getInsforgeClient } from '../lib/insforgeClient';

export interface OnboardingStepData {
  1?: Record<string, unknown>;
  2?: Record<string, unknown>;
  3?: Record<string, unknown>;
  4?: Record<string, unknown>;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: number;
  completedAt: string | null;
  profileCompleted: boolean;
  vehicleAdded: boolean;
  serviceBaselineCompleted: boolean;
  remindersCompleted: boolean;
  stepData: OnboardingStepData | null;
  updatedAt: string;
}

export interface OnboardingProgressUpdatePayload {
  currentStep?: number;
  profileCompleted?: boolean;
  vehicleAdded?: boolean;
  serviceBaselineCompleted?: boolean;
  remindersCompleted?: boolean;
  stepData?: OnboardingStepData | null;
}

export async function fetchOnboardingProgress(
  userId: string,
): Promise<OnboardingProgress | null> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      currentStep: data.current_step ?? 1,
      completedAt: data.completed_at ?? null,
      profileCompleted: Boolean(data.profile_completed),
      vehicleAdded: Boolean(data.vehicle_added),
      serviceBaselineCompleted: Boolean(data.service_baseline_completed),
      remindersCompleted: Boolean(data.reminders_completed),
      stepData: (data.step_data as OnboardingStepData) ?? null,
      updatedAt: data.updated_at ?? data.created_at ?? new Date().toISOString(),
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch onboarding progress.', err);
    return null;
  }
}

export async function upsertOnboardingProgress(
  userId: string,
  payload: OnboardingProgressUpdatePayload,
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const dbPayload: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    if (payload.currentStep != null) dbPayload.current_step = payload.currentStep;
    if (payload.profileCompleted != null)
      dbPayload.profile_completed = payload.profileCompleted;
    if (payload.vehicleAdded != null)
      dbPayload.vehicle_added = payload.vehicleAdded;
    if (payload.serviceBaselineCompleted != null)
      dbPayload.service_baseline_completed = payload.serviceBaselineCompleted;
    if (payload.remindersCompleted != null)
      dbPayload.reminders_completed = payload.remindersCompleted;
    if (payload.stepData !== undefined)
      dbPayload.step_data = payload.stepData;

    const { error } = await client.database
      .from('onboarding_progress')
      .upsert(dbPayload, {
        onConflict: 'user_id',
      });

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to upsert onboarding progress.', error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to upsert onboarding progress.', err);
    return false;
  }
}

export async function resetOnboardingProgress(userId: string): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const now = new Date().toISOString();
    const { error } = await client.database
      .from('onboarding_progress')
      .upsert(
        {
          user_id: userId,
          current_step: 1,
          completed_at: null,
          profile_completed: false,
          vehicle_added: false,
          service_baseline_completed: false,
          reminders_completed: false,
          step_data: null,
          updated_at: now,
        },
        { onConflict: 'user_id' },
      );

    return !error;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to reset onboarding progress.', err);
    return false;
  }
}

export async function completeOnboarding(userId: string): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const now = new Date().toISOString();
    const { error } = await client.database
      .from('onboarding_progress')
      .upsert(
        {
          user_id: userId,
          current_step: 5,
          completed_at: now,
          profile_completed: true,
          vehicle_added: true,
          service_baseline_completed: true,
          reminders_completed: true,
          step_data: null,
          updated_at: now,
        },
        { onConflict: 'user_id' },
      );

    return !error;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to complete onboarding.', err);
    return false;
  }
}
