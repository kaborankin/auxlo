import crypto from 'crypto';
import prisma from '@/lib/db';
import { isSuperAdmin, getUserMembership } from '@/lib/authorize';

/**
 * Access control for Pajo pages.
 *
 * Reuses the existing Organization/UserMembership/Role RBAC: an org-level
 * ORG_ADMIN or ORG_MANAGER can administer any pot in their organization.
 * A user who is directly a PotMember (added by an admin) can view their
 * pot's dashboard and manage their own contributions even without a wider
 * org role — this covers the 10 rotating members who just need to see the
 * ledger and mark their own payments as sent.
 *
 * ISOLATION RULE: an organisation-level membership that is NOT an admin role
 * (notably CLIENT, which the pot join flow creates) grants no pot access at
 * all. Circles must stay isolated — joining one pot must never expose another
 * pot's members, ledger or payouts. Pot access for non-admins therefore
 * requires an explicit PotMember row.
 */

export type PajoRole = 'admin' | 'member' | null;

export interface PajoAccess {
  pot: { id: string; slug: string; name: string; organizationId: string };
  role: PajoRole;
  potMemberId: string | null;
}

/**
 * Preview mode: when PAJO_BYPASS_AUTH=true, /pajo pages render without a
 * session (read-only — admin action APIs still require real auth). Intended
 * for reviewing the dashboard before NextAuth accounts are set up; flip the
 * flag to false in .env once real treasurer/member logins exist.
 */
export function isPajoPreviewMode(): boolean {
  return process.env.PAJO_BYPASS_AUTH === 'true';
}

export async function getPajoAccess(userId: string, potSlug: string): Promise<PajoAccess | null> {
  const pot = await prisma.pot.findUnique({
    where: { slug: potSlug },
    select: { id: true, slug: true, name: true, organizationId: true },
  });
  if (!pot) return null;

  if (await isSuperAdmin(userId)) {
    return { pot, role: 'admin', potMemberId: null };
  }

  const orgMembership = await getUserMembership(userId, pot.organizationId);
  const potMember = await prisma.potMember.findUnique({
    where: { potId_userId: { potId: pot.id, userId } },
    select: { id: true },
  });

  if (orgMembership && (orgMembership.role === 'ORG_ADMIN' || orgMembership.role === 'ORG_MANAGER')) {
    return { pot, role: 'admin', potMemberId: potMember?.id ?? null };
  }

  // Non-admins need a real PotMember row. A plain org membership (such as the
  // CLIENT row created when someone joins ONE pot) deliberately does NOT grant
  // access here — otherwise every member of a circle could open every other
  // circle in the same organisation.
  if (potMember) {
    return { pot, role: 'member', potMemberId: potMember.id };
  }

  return null;
}

/**
 * Result of validating a pot invitation. Deliberately generic — callers
 * must not leak *why* an invitation failed (pot doesn't exist vs. wrong
 * token vs. expired) to keep pot existence/slugs from being enumerable.
 */
export type PotInvitationResult =
  | { ok: true; pot: { id: string; slug: string; name: string; organizationId: string; contributionAmount: number; currency: string; memberTarget: number; frequency: string; payoutMethod: string } }
  | { ok: false };

/** Constant-time string comparison — avoids leaking token length/prefix via timing. */
function safeTokenEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run timingSafeEqual against a same-length buffer so the
    // early-return itself doesn't become a distinguishing timing signal
    // for wildly different lengths (best-effort — length itself is not
    // secret here since tokens are a fixed 64 hex chars).
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates a pot join invitation (slug + token) server-side. This is the
 * single choke point every join-related endpoint must call — the frontend
 * is never trusted to decide whether an invitation is valid. Returns a
 * generic { ok: false } for every failure mode (pot missing, no token
 * configured, token mismatch, expired) so callers can't distinguish
 * "wrong token" from "pot doesn't exist" and enumerate private pots.
 */
export async function validatePotInvitation(potSlug: string, token: string | null | undefined): Promise<PotInvitationResult> {
  if (!token) return { ok: false };

  const pot = await prisma.pot.findUnique({
    where: { slug: potSlug },
    select: {
      id: true, slug: true, name: true, organizationId: true,
      contributionAmount: true, currency: true, memberTarget: true,
      frequency: true, payoutMethod: true,
      inviteToken: true, inviteExpiresAt: true,
    },
  });

  if (!pot || !pot.inviteToken) return { ok: false };
  if (!safeTokenEquals(pot.inviteToken, token)) return { ok: false };
  if (pot.inviteExpiresAt && pot.inviteExpiresAt.getTime() < Date.now()) return { ok: false };

  return {
    ok: true,
    pot: {
      id: pot.id,
      slug: pot.slug,
      name: pot.name,
      organizationId: pot.organizationId,
      contributionAmount: pot.contributionAmount,
      currency: pot.currency,
      memberTarget: pot.memberTarget,
      frequency: pot.frequency,
      payoutMethod: pot.payoutMethod,
    },
  };
}

/**
 * All pots a user can see — for the `/pajo` picker page.
 *
 * Admins/managers (and super admins) see every pot in the organisations they
 * administer. Everyone else sees ONLY the pots they hold a PotMember row for:
 * an org-level membership such as CLIENT — created automatically when someone
 * joins a single pot — must not reveal the other circles' ledgers.
 */
export async function getPajoPotsForUser(userId: string) {
  if (await isSuperAdmin(userId)) {
    return prisma.pot.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Organisations where this user is a pot administrator.
  const adminMemberships = await prisma.userMembership.findMany({
    where: { userId, role: { in: ['ORG_ADMIN', 'ORG_MANAGER'] } },
    select: { organizationId: true },
  });
  const adminOrgIds = adminMemberships.map((m) => m.organizationId);

  const [orgPots, memberPots] = await Promise.all([
    // `in: []` intentionally matches nothing, so a non-admin gets no pots here.
    prisma.pot.findMany({
      where: { organizationId: { in: adminOrgIds } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pot.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const byId = new Map(orgPots.map((p) => [p.id, p]));
  for (const p of memberPots) byId.set(p.id, p);
  return Array.from(byId.values());
}

/** Safe, metadata-only shape of a discoverable pot. Deliberately excludes
 *  bankDetails, rulesText, inviteToken, member identities, contributions and
 *  the payout schedule. */
export interface DiscoverablePot {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  contributionAmount: number;
  currency: string;
  frequency: string;
  memberTarget: number;
  memberCount: number;
  payoutMethod: string;
  organizationName: string;
  /** The signed-in user's own request state for this pot, if they made one. */
  myRequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

/**
 * Pots a signed-in NON-member may *discover* — i.e. see advertised, but not
 * enter. Access to the pot itself still requires a PotMember row (see
 * getPajoAccess); this list is display-only.
 *
 * Guardrails, all deliberate:
 *  - `openForJoining` must be true — a treasurer opts a pot in. Private pots
 *    are never listed, whatever the URL guesses.
 *  - Scoped to organisations the user ALREADY belongs to, so one tenant's
 *    circles are never advertised to another tenant's members.
 *  - Excludes pots the user is already in (that's getPajoPotsForUser's job).
 *  - Returns metadata only. Members, ledger, payouts and bank details are
 *    never exposed - discovering a circle must not disclose its money.
 */
export async function getDiscoverablePotsForUser(userId: string): Promise<DiscoverablePot[]> {
  const memberships = await prisma.userMembership.findMany({
    where: { userId },
    select: { organizationId: true },
  });
  const orgIds = memberships.map((m) => m.organizationId);
  if (orgIds.length === 0) return [];

  const pots = await prisma.pot.findMany({
    where: {
      openForJoining: true,
      status: 'active',
      organizationId: { in: orgIds },
      members: { none: { userId } },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      contributionAmount: true,
      currency: true,
      frequency: true,
      memberTarget: true,
      payoutMethod: true,
      organization: { select: { name: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (pots.length === 0) return [];

  const requests = await prisma.potJoinRequest.findMany({
    where: { userId, potId: { in: pots.map((p) => p.id) } },
    select: { potId: true, status: true },
  });
  const statusByPotId = new Map(requests.map((r) => [r.potId, r.status]));

  return pots.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    contributionAmount: p.contributionAmount,
    currency: p.currency,
    frequency: p.frequency,
    memberTarget: p.memberTarget,
    memberCount: p._count.members,
    payoutMethod: p.payoutMethod,
    organizationName: p.organization.name,
    myRequestStatus: statusByPotId.get(p.id) ?? null,
  }));
}

