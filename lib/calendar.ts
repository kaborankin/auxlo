import { google, calendar_v3 } from 'googleapis';

/**
 * Google Calendar Integration for Auxlo
 * 
 * Supports two authentication modes:
 * 1. Service Account (recommended for production) - automated calendar management
 * 2. OAuth2 (for user-specific calendars) - requires user consent flow
 * 
 * Environment variables:
 * - GOOGLE_CALENDAR_TYPE: 'service_account' or 'oauth'
 * - For service account:
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   - GOOGLE_PRIVATE_KEY (base64 encoded)
 *   - GOOGLE_CALENDAR_ID (target calendar)
 * - For OAuth:
 *   - GOOGLE_CLIENT_ID
 *   - GOOGLE_CLIENT_SECRET
 *   - GOOGLE_REDIRECT_URI
 */

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: { type: 'hangoutsMeet' };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

let calendarClient: calendar_v3.Calendar | null = null;
let authClient: any | null = null;

/**
 * Initialize Google Calendar client with service account
 */
export function initServiceAccountCalendar(): calendar_v3.Calendar | null {
  if (calendarClient) return calendarClient;

  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyBase64 = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceAccountEmail || !privateKeyBase64) {
      console.warn('Google Calendar service account credentials not configured');
      return null;
    }

    // Decode base64 private key
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    calendarClient = google.calendar({ version: 'v3', auth });
    console.log('Google Calendar initialized with service account');
    return calendarClient;
  } catch (error) {
    console.error('Failed to initialize Google Calendar service account:', error);
    return null;
  }
}

/**
 * Initialize OAuth2 client for user-based calendar access
 */
export function initOAuth2Client(): any | null {
  if (authClient) return authClient;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.warn('Google OAuth2 credentials not configured');
    return null;
  }

  authClient = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  return authClient;
}

/**
 * Get OAuth2 authorization URL for user consent
 */
export function getAuthUrl(): string | null {
  const oauth2Client = initOAuth2Client();
  if (!oauth2Client) return null;

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = initOAuth2Client();
  if (!oauth2Client) throw new Error('OAuth2 client not initialized');

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * Create a calendar event for a booking
 */
export async function createBookingEvent(
  event: CalendarEvent,
  options: {
    sendNotifications?: boolean;
    conferenceData?: boolean;
  } = {}
): Promise<{ eventId: string; htmlLink: string } | null> {
  try {
    const calendar = initServiceAccountCalendar();
    if (!calendar) {
      console.warn('Google Calendar not initialized - skipping event creation');
      return null;
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const { sendNotifications = true, conferenceData = false } = options;

    const eventResource: calendar_v3.Schema$Event = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startDateTime,
        timeZone: 'Europe/London', // UK timezone
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'Europe/London',
      },
      attendees: event.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus || 'needsAction',
      })),
      reminders: event.reminders || {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 },      // 1 hour before
        ],
      },
    };

    // Add Google Meet conference link if requested
    if (conferenceData) {
      eventResource.conferenceData = {
        createRequest: {
          requestId: `booking-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventResource,
      sendNotifications,
      conferenceDataVersion: conferenceData ? 1 : 0,
    });

    console.log('Calendar event created:', response.data.id);

    return {
      eventId: response.data.id!,
      htmlLink: response.data.htmlLink!,
    };
  } catch (error: any) {
    console.error('Failed to create calendar event:', error?.message || error);
    // Don't throw - calendar creation shouldn't block booking
    return null;
  }
}

/**
 * Update an existing calendar event
 */
export async function updateBookingEvent(
  eventId: string,
  updates: Partial<CalendarEvent>,
  options: { sendNotifications?: boolean } = {}
): Promise<boolean> {
  try {
    const calendar = initServiceAccountCalendar();
    if (!calendar) {
      console.warn('Google Calendar not initialized - skipping event update');
      return false;
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const { sendNotifications = true } = options;

    // Get existing event first
    const existingEvent = await calendar.events.get({
      calendarId,
      eventId,
    });

    if (!existingEvent.data) {
      console.warn('Calendar event not found:', eventId);
      return false;
    }

    const updatedResource: calendar_v3.Schema$Event = {
      ...existingEvent.data,
    };

    // Apply updates
    if (updates.summary) updatedResource.summary = updates.summary;
    if (updates.description) updatedResource.description = updates.description;
    if (updates.location) updatedResource.location = updates.location;
    if (updates.startDateTime) {
      updatedResource.start = {
        dateTime: updates.startDateTime,
        timeZone: 'Europe/London',
      };
    }
    if (updates.endDateTime) {
      updatedResource.end = {
        dateTime: updates.endDateTime,
        timeZone: 'Europe/London',
      };
    }
    if (updates.attendees) {
      updatedResource.attendees = updates.attendees.map(a => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus || 'needsAction',
      }));
    }

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: updatedResource,
      sendNotifications,
    });

    console.log('Calendar event updated:', eventId);
    return true;
  } catch (error: any) {
    console.error('Failed to update calendar event:', error?.message || error);
    return false;
  }
}

/**
 * Cancel a calendar event
 */
export async function cancelBookingEvent(
  eventId: string,
  options: { sendNotifications?: boolean } = {}
): Promise<boolean> {
  try {
    const calendar = initServiceAccountCalendar();
    if (!calendar) {
      console.warn('Google Calendar not initialized - skipping event cancellation');
      return false;
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const { sendNotifications = true } = options;

    await calendar.events.delete({
      calendarId,
      eventId,
      sendNotifications,
    });

    console.log('Calendar event cancelled:', eventId);
    return true;
  } catch (error: any) {
    console.error('Failed to cancel calendar event:', error?.message || error);
    return false;
  }
}

/**
 * Helper to convert booking data to calendar event format
 */
export function bookingToCalendarEvent(booking: {
  id: string;
  bookingType: string;
  service: { title: string };
  customerInfo: { name: string; email: string; company?: string };
  date: string;
  time: string;
  location?: string;
  notes?: string;
}): CalendarEvent {
  // Parse date and time to create start/end DateTimes
  const startDateTime = new Date(`${booking.date}T${booking.time || '09:00'}:00`);
  
  // Default duration: 1 hour for digital, 2 hours for studio/live
  const durationHours = booking.bookingType === 'digital_services' ? 1 : 2;
  const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

  return {
    summary: `${booking.service.title} - ${booking.customerInfo.name}`,
    description: `
Booking ID: ${booking.id}
Type: ${booking.bookingType.replace('_', ' ')}
Customer: ${booking.customerInfo.name}${booking.customerInfo.company ? ` (${booking.customerInfo.company})` : ''}
Email: ${booking.customerInfo.email}

${booking.notes || ''}
    `.trim(),
    location: booking.location || 'TBD',
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    attendees: [
      {
        email: booking.customerInfo.email,
        displayName: booking.customerInfo.name,
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'email', minutes: 60 },      // 1 hour before
        { method: 'popup', minutes: 15 },      // 15 minutes before
      ],
    },
  };
}

/**
 * Helper to check if calendar is properly configured
 */
export function isCalendarConfigured(): boolean {
  const type = process.env.GOOGLE_CALENDAR_TYPE || 'service_account';
  
  if (type === 'service_account') {
    return !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  }
  
  if (type === 'oauth') {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  
  return false;
}

export default {
  initServiceAccountCalendar,
  initOAuth2Client,
  getAuthUrl,
  getTokensFromCode,
  createBookingEvent,
  updateBookingEvent,
  cancelBookingEvent,
  bookingToCalendarEvent,
  isCalendarConfigured,
};
