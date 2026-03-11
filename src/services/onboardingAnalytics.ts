import { getInsforgeClient } from '../lib/insforgeClient';

export interface OnboardingFunnelRow {
  event: string;
  step: number | null;
  count: number;
}

export interface OnboardingFunnel {
  started: number;
  step1Done: number;
  step2Done: number;
  step3Done: number;
  step4Done: number;
  completed: number;
  byEvent: OnboardingFunnelRow[];
}

export async function fetchOnboardingFunnel(
  startDate?: string,
  endDate?: string,
): Promise<OnboardingFunnel> {
  const start = startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const end = endDate ?? new Date().toISOString();

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database.rpc('get_onboarding_funnel', {
      p_start: start,
      p_end: end,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch onboarding funnel.', error);
      return emptyFunnel();
    }

    const rows = (data ?? []) as { event: string; step: number | null; count: string }[];
    const byEvent: OnboardingFunnelRow[] = rows.map((r) => ({
      event: r.event,
      step: r.step,
      count: Number(r.count) || 0,
    }));

    const funnel: OnboardingFunnel = {
      started: 0,
      step1Done: 0,
      step2Done: 0,
      step3Done: 0,
      step4Done: 0,
      completed: 0,
      byEvent,
    };

    for (const r of byEvent) {
      const c = r.count;
      switch (r.event) {
        case 'started':
          funnel.started += c;
          break;
        case 'step_1_done':
          funnel.step1Done += c;
          break;
        case 'step_2_done':
          funnel.step2Done += c;
          break;
        case 'step_3_done':
          funnel.step3Done += c;
          break;
        case 'step_4_done':
          funnel.step4Done += c;
          break;
        case 'completed':
          funnel.completed += c;
          break;
        default:
          break;
      }
    }

    return funnel;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Onboarding funnel unavailable.', err);
    return emptyFunnel();
  }
}

function emptyFunnel(): OnboardingFunnel {
  return {
    started: 0,
    step1Done: 0,
    step2Done: 0,
    step3Done: 0,
    step4Done: 0,
    completed: 0,
    byEvent: [],
  };
}

export async function recordOnboardingEvent(
  userId: string,
  event: string,
  step?: number,
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database.from('onboarding_events').insert([
      { user_id: userId, event, step: step ?? null },
    ]);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to record onboarding event.', error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Onboarding event recording failed.', err);
    return false;
  }
}
