/**
 * Authorization helpers for RBAC + multi-tenancy
 * Provides utilities to check permissions and enforce access control
 */

import prisma from './db';

// Role will be available after prisma generate
export type Role = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ORG_MANAGER' | 'ORG_VIEWER' | 'CLIENT';

export interface SessionUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthContext {
  userId: string;
  email: string;
  memberships: Array<{
    organizationId: string;
    role: Role;
    orgName: string;
    orgSlug: string;
  }>;
  currentOrgId?: string;
}

/**
 * Get user memberships across all organizations
 */
export async function getUserMemberships(userId: string) {
  const memberships = await prisma.userMembership.findMany({
    where: { userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return memberships.map((m: any) => ({
    organizationId: m.organizationId,
    role: m.role,
    orgName: m.organization.name,
    orgSlug: m.organization.slug,
  }));
}

/**
 * Get a specific membership for user in an organization
 */
export async function getUserMembership(userId: string, orgId: string) {
  const membership = await prisma.userMembership.findFirst({
    where: { userId, organizationId: orgId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!membership) return null;

  return {
    organizationId: membership.organizationId,
    role: membership.role,
    orgName: membership.organization.name,
    orgSlug: membership.organization.slug,
  };
}

/**
 * Check if user is a super admin (has access to all orgs)
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const membership = await prisma.userMembership.findFirst({
    where: { userId, role: 'SUPER_ADMIN' },
  });
  return !!membership;
}

/**
 * Build full auth context for a user
 */
export async function buildAuthContext(userId: string, email: string): Promise<AuthContext> {
  const memberships = await getUserMemberships(userId);
  
  return {
    userId,
    email,
    memberships,
    currentOrgId: memberships[0]?.organizationId,
  };
}

/**
 * Require user to have one of the specified roles in the organization
 * Throws if user doesn't have access
 */
export async function requireOrgRole(
  userId: string,
  orgId: string,
  allowedRoles: Role[]
): Promise<void> {
  // Super admins bypass role checks
  if (await isSuperAdmin(userId)) {
    return;
  }

  const membership = await getUserMembership(userId, orgId);
  
  if (!membership) {
    throw new Error('FORBIDDEN: No access to this organization');
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new Error(`FORBIDDEN: Requires one of: ${allowedRoles.join(', ')}`);
  }
}

/**
 * Check if user can manage an organization (ORG_ADMIN or SUPER_ADMIN)
 */
export async function canManageOrganization(
  user: SessionUser,
  organizationId: string
): Promise<boolean> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { email: user.email },
  });

  if (!userProfile) return false;

  // Super admins can manage any org
  if (await isSuperAdmin(userProfile.id)) {
    return true;
  }

  // Check if user has ORG_ADMIN role in this org
  const membership = await getUserMembership(userProfile.id, organizationId);
  return membership?.role === 'ORG_ADMIN';
}

/**
 * Require user to have access to an organization (any role)
 * Throws if user doesn't have access
 */
export async function requireOrgAccess(userId: string, orgId: string) {
  if (await isSuperAdmin(userId)) {
    return;
  }

  const membership = await getUserMembership(userId, orgId);
  
  if (!membership) {
    throw new Error('FORBIDDEN: No access to this organization');
  }
}

/**
 * Check if user can perform an action on a resource
 */
export async function canPerformAction(
  userId: string,
  orgId: string,
  action: 'create' | 'read' | 'update' | 'delete'
): Promise<boolean> {
  // Super admins can do anything
  if (await isSuperAdmin(userId)) {
    return true;
  }

  const membership = await getUserMembership(userId, orgId);
  if (!membership) return false;

  const { role } = membership;

  // Define permissions by role
  const permissions: Record<Role, Set<string>> = {
    SUPER_ADMIN: new Set(['create', 'read', 'update', 'delete']),
    ORG_ADMIN: new Set(['create', 'read', 'update', 'delete']),
    ORG_MANAGER: new Set(['create', 'read', 'update']),
    ORG_VIEWER: new Set(['read']),
    CLIENT: new Set(['read']),
  };

  return permissions[role as Role]?.has(action) || false;
}

/**
 * Filter organizations to only those user has access to
 * Returns all org IDs if super admin, otherwise only authorized orgs
 */
export async function getAuthorizedOrgIds(userId: string): Promise<string[]> {
  if (await isSuperAdmin(userId)) {
    // Super admins see all orgs
    const allOrgs = await prisma.organization.findMany({
      select: { id: true },
    });
    return allOrgs.map((org: any) => org.id);
  }

  const memberships = await getUserMemberships(userId);
  return memberships.map((m: any) => m.organizationId);
}

/**
 * Check if user is a dev/super admin (for special UI features)
 */
export async function isDevUser(email: string): Promise<boolean> {
  const devEmails = process.env.DEV_EMAILS?.split(',') || ['hello@auxlo.uk'];
  return devEmails.includes(email);
}

/**
 * Validate and return organization ID from request, ensuring user has access
 */
export async function validateOrgAccess(
  userId: string,
  requestedOrgId?: string | null
): Promise<string> {
  if (!requestedOrgId) {
    throw new Error('FORBIDDEN: Organization ID required');
  }

  await requireOrgAccess(userId, requestedOrgId);
  return requestedOrgId;
}
