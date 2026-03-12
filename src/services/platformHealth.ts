import { getInsforgeClient } from '../lib/insforgeClient';

export interface PlatformHealthMetrics {
  /** Login failure rate (0–100) from audit_logs in last 24h */
  loginErrorRatePct: number;
  /** Successful logins in last 24h */
  successfulLogins24h: number;
  /** Failed logins in last 24h */
  failedLogins24h: number;
  /** Total audit actions in last 24h */
  totalActions24h: number;
}

export interface HealthProbeResult {
  ok: boolean;
  latencyMs: number;
  timestamp: number;
}

const PROBE_HISTORY_SIZE = 60; // Keep last 60 probes for uptime %
const probeHistory: HealthProbeResult[] = [];

/**
 * Fetches server-side platform health metrics (error rates, login stats).
 * Requires platform admin role.
 */
export async function fetchPlatformHealth(): Promise<PlatformHealthMetrics | null> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database.rpc('admin_platform_health');

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch platform health metrics.', error);
      return null;
    }

    const m = data as Record<string, unknown>;
    return {
      loginErrorRatePct: Number(m.loginErrorRatePct ?? 0),
      successfulLogins24h: Number(m.successfulLogins24h ?? 0),
      failedLogins24h: Number(m.failedLogins24h ?? 0),
      totalActions24h: Number(m.totalActions24h ?? 0),
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Platform health fetch failed.', err);
    return null;
  }
}

/**
 * Runs a lightweight API probe and records latency.
 * Uses admin_dashboard_metrics as a representative API call.
 */
export async function runHealthProbe(): Promise<HealthProbeResult> {
  const start = performance.now();
  try {
    const client = getInsforgeClient();
    const { error } = await client.database.rpc('admin_dashboard_metrics');
    const latencyMs = Math.round(performance.now() - start);
    const ok = !error;

    const result: HealthProbeResult = { ok, latencyMs, timestamp: Date.now() };
    probeHistory.push(result);
    if (probeHistory.length > PROBE_HISTORY_SIZE) {
      probeHistory.shift();
    }
    return result;
  } catch {
    const latencyMs = Math.round(performance.now() - start);
    const result: HealthProbeResult = { ok: false, latencyMs, timestamp: Date.now() };
    probeHistory.push(result);
    if (probeHistory.length > PROBE_HISTORY_SIZE) {
      probeHistory.shift();
    }
    return result;
  }
}

/**
 * Returns uptime percentage from recent probe history.
 */
export function getUptimeFromProbes(): number | null {
  if (probeHistory.length === 0) return null;
  const okCount = probeHistory.filter((p) => p.ok).length;
  return Math.round((okCount / probeHistory.length) * 10000) / 100;
}

/**
 * Returns average response time (ms) from recent successful probes.
 */
export function getAvgLatencyFromProbes(): number | null {
  const okProbes = probeHistory.filter((p) => p.ok);
  if (okProbes.length === 0) return null;
  const sum = okProbes.reduce((s, p) => s + p.latencyMs, 0);
  return Math.round(sum / okProbes.length);
}

/**
 * Returns the latest probe result.
 */
export function getLatestProbe(): HealthProbeResult | null {
  return probeHistory.length > 0 ? probeHistory[probeHistory.length - 1]! : null;
}
