import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { reportContributionPayment } from '@/lib/pajo/mutations';
import { emitNotification } from '@/lib/pajo/notifications';

/** Member: report "I've paid" for their own contribution. Sets PAYMENT_REPORTED. */
export async function POST(
  request: Request,
  props: { params: Promise<{ contributionId: string }> },
) {
  const params = await props.params;
  const { contributionId } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prisma.userProfile.findUnique({ 
    where: { email: session.user.email as string } 
  });
  if (!userProfile) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const reference = typeof body.reference === 'string' ? body.reference : undefined;

  try {
    const contribution = await reportContributionPayment({
      contributionId,
      userId: userProfile.id,
      actorEmail: userProfile.email,
      reference,
    });

    // Notify the Treasurer(s)
    const pot = await prisma.pot.findFirst({
      where: {
        cycles: {
          some: {
            weeks: {
              some: {
                contributions: {
                  some: { id: contributionId }
                }
              }
            }
          }
        }
      },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'ORG_ADMIN' }
            }
          }
        }
      }
    });

    if (pot) {
      for (const t of pot.organization.members) {
        await emitNotification({
          userId: t.userId,
          potId: pot.id,
          organizationId: pot.organizationId,
          type: 'TRANSACTIONAL',
          category: 'payment',
          title: 'Payment Reported',
          message: `${userProfile.name} has reported paying ${contribution.amountDue} for ${pot.name}.`,
          ctaUrl: `/pajo/${pot.slug}`,
          ctaText: 'Verify Payment'
        });
      }
    }

    return NextResponse.json({ ok: true, contribution });
  } catch (error: any) {
    const status = error?.code === 'NOT_FOUND' ? 404 : error?.code === 'NOT_YOUR_CONTRIBUTION' ? 403 : 400;
    return NextResponse.json({ ok: false, error: error.message ?? 'Failed to report payment' }, { status });
  }
}
