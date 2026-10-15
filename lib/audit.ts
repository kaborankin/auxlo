/**
 * Audit logging for sensitive operations
 * Records user actions for security and compliance
 */

import prisma from './db';

export interface AuditLogParams {
  organizationId?: string | null;
  actorId?: string;
  actorEmail?: string;
  action: string;
  resource?: string;
  resourceType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId || undefined,
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        action: params.action,
        resource: params.resource,
        resourceType: params.resourceType,
        details: params.details || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log booking-related actions
 */
export async function auditBookingAction(
  action: 'created' | 'updated' | 'cancelled' | 'deleted',
  bookingId: string,
  actorId: string,
  actorEmail: string,
  organizationId?: string | null,
  details?: Record<string, any>
) {
  await createAuditLog({
    organizationId,
    actorId,
    actorEmail,
    action: `booking.${action}`,
    resource: `booking:${bookingId}`,
    resourceType: 'booking',
    details,
  });
}

/**
 * Log user/membership actions
 */
export async function auditUserAction(
  action: 'created' | 'updated' | 'deleted' | 'impersonated' | 'role_changed',
  userId: string,
  actorId: string,
  actorEmail: string,
  organizationId?: string | null,
  details?: Record<string, any>
) {
  await createAuditLog({
    organizationId,
    actorId,
    actorEmail,
    action: `user.${action}`,
    resource: `user:${userId}`,
    resourceType: 'user',
    details,
  });
}

/**
 * Log organization actions
 */
export async function auditOrgAction(
  action: 'created' | 'updated' | 'deleted',
  orgId: string,
  actorId: string,
  actorEmail: string,
  details?: Record<string, any>
) {
  await createAuditLog({
    organizationId: orgId,
    actorId,
    actorEmail,
    action: `organization.${action}`,
    resource: `organization:${orgId}`,
    resourceType: 'organization',
    details,
  });
}

/**
 * Get audit logs for an organization
 */
export async function getAuditLogs(
  organizationId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: string;
    actorId?: string;
  }
) {
  const where: any = { organizationId };
  
  if (options?.action) {
    where.action = options.action;
  }
  
  if (options?.actorId) {
    where.actorId = options.actorId;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
    skip: options?.offset || 0,
  });

  return logs;
}
