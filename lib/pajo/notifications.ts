import prisma from '@/lib/db';
import { sendPajoEmail } from './email';

export type NotificationCategory = 
  | 'payment' 
  | 'cycle' 
  | 'payout' 
  | 'invite' 
  | 'system';

export type NotificationType = 'TRANSACTIONAL' | 'PROMOTIONAL';

interface CreateNotificationParams {
  userId: string;
  organizationId?: string;
  potId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  ctaUrl?: string;
  ctaText?: string;
  imageUrl?: string;
}

/**
 * Emit a notification to a user.
 * This creates an in-app notification and sends an email for transactional events.
 */
export async function emitNotification({
  userId,
  organizationId,
  potId,
  type,
  category,
  title,
  message,
  ctaUrl,
  ctaText,
  imageUrl
}: CreateNotificationParams) {
  try {
    // 1. Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        organizationId,
        potId,
        type,
        category,
        title,
        message,
        ctaUrl,
        ctaText,
        imageUrl,
      },
      include: {
        user: true
      }
    });

    // 2. Send email for transactional notifications
    if (type === 'TRANSACTIONAL' && notification.user.email) {
      await sendPajoEmail({
        to: notification.user.email,
        subject: `[Pajo] ${title}`,
        title: title,
        message: message,
        ctaUrl: ctaUrl,
        ctaText: ctaText,
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to emit notification:', error);
    return null;
  }
}


/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string) {
  return await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}
