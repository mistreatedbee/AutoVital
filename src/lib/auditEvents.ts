/**
 * Audit event helpers – call createAuditLogEntry with consistent action/entity types.
 * Use from auth flows, admin actions, and other key events.
 */

import { createAuditLogEntry } from '../services/auditLog';

export interface AuditActor {
  userId: string | null;
  email: string | null;
}

async function log(
  actor: AuditActor,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await createAuditLogEntry({
    actorUserId: actor.userId,
    actorEmail: actor.email,
    action,
    entityType,
    entityId: entityId ?? null,
    metadata: metadata ?? {},
  });
}

export async function auditUserSignup(
  actor: AuditActor,
  userId: string,
  metadata?: { email?: string },
): Promise<void> {
  await log(actor, 'user.signup', 'user', userId, metadata);
}

export async function auditEmailVerified(
  actor: AuditActor,
  userId: string,
  metadata?: { email?: string },
): Promise<void> {
  await log(actor, 'user.email_verified', 'user', userId, metadata);
}

export async function auditLogin(
  actor: AuditActor,
  metadata?: { email?: string },
): Promise<void> {
  await log(actor, 'user.login', 'user', actor.userId ?? undefined, metadata);
}

export async function auditLoginFailed(
  actor: AuditActor,
  metadata?: { email?: string; reason?: string },
): Promise<void> {
  await log(actor, 'user.login_failed', 'user', undefined, metadata);
}

export async function auditPlanCreated(
  actor: AuditActor,
  planId: string,
  metadata?: { code?: string; name?: string },
): Promise<void> {
  await log(actor, 'plan.created', 'plan', planId, metadata);
}

export async function auditPlanUpdated(
  actor: AuditActor,
  planId: string,
  metadata?: { code?: string; name?: string },
): Promise<void> {
  await log(actor, 'plan.updated', 'plan', planId, metadata);
}

export async function auditUserStatusUpdated(
  actor: AuditActor,
  targetUserId: string,
  metadata?: { status?: string },
): Promise<void> {
  await log(actor, 'user.status_updated', 'user', targetUserId, metadata);
}

export async function auditUserFlagged(
  actor: AuditActor,
  targetUserId: string,
  metadata?: { flagged: boolean; reason?: string },
): Promise<void> {
  await log(actor, 'user.flagged', 'user', targetUserId, metadata);
}

export async function auditUserProfileUpdated(
  actor: AuditActor,
  targetUserId: string,
  metadata?: { displayName?: string },
): Promise<void> {
  await log(actor, 'user.profile_updated', 'user', targetUserId, metadata);
}

export async function auditTemplateUpdated(
  actor: AuditActor,
  templateId: string,
  metadata?: { type?: string; name?: string },
): Promise<void> {
  await log(actor, 'template.updated', 'template', templateId, metadata);
}

export async function auditReportGenerated(
  actor: AuditActor,
  metadata?: { reportType?: string },
): Promise<void> {
  await log(actor, 'report.generated', 'report', undefined, metadata);
}

export async function auditOrganizationCreated(
  actor: AuditActor,
  accountId: string,
  metadata?: { name?: string },
): Promise<void> {
  await log(actor, 'organization.created', 'organization', accountId, metadata);
}
