// Database-based analytics (replacement for GCS-based analytics.ts)
import prisma from '@/lib/db';

export interface LeadSummary {
  totalLeads: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  topSources: [string, number][];
  topTypes: [string, number][];
  leads: ContactLead[];
  dateRange: { startDate: string; endDate: string };
}

export interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  serviceInterest?: string | null;
  subject?: string | null;
  urgency?: string | null;
  budget?: string | null;
  timeline?: string | null;
  source: string;
  status: string;
  createdAt: Date;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Get leads/contacts from database for date range
 */
export async function getLeadsFromDatabase(
  startDate: string, 
  endDate: string,
  organizationId?: string
): Promise<ContactLead[]> {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const contacts = await prisma.contactSubmission.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return contacts;
  } catch (error) {
    console.error('Error fetching leads from database:', error);
    return [];
  }
}

/**
 * Generate lead analytics summary from database
 */
export async function generateLeadSummary(
  startDate: string,
  endDate: string,
  organizationId?: string
): Promise<LeadSummary> {
  const leads = await getLeadsFromDatabase(startDate, endDate, organizationId);
  
  const totalLeads = leads.length;
  const totalConversions = leads.filter(l => l.status === 'converted' || l.status === 'customer').length;
  const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads * 100) : 0;
  
  // Count by source
  const sourceCount: Record<string, number> = {};
  leads.forEach(lead => {
    sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
  });
  
  // Count by service interest (type)
  const typeCount: Record<string, number> = {};
  leads.forEach(lead => {
    const type = lead.serviceInterest || 'general';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  const topSources = Object.entries(sourceCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const topTypes = Object.entries(typeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return {
    totalLeads,
    totalConversions,
    totalRevenue: 0, // Can be calculated if you have revenue data
    conversionRate: Number(conversionRate.toFixed(2)),
    topSources,
    topTypes,
    leads,
    dateRange: { startDate, endDate },
  };
}

/**
 * Get organizations with their contact counts
 */
export async function getOrganizationsWithCounts() {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            members: true,
            contacts: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

/**
 * Get all users with their organization memberships
 */
export async function getUsersWithOrganizations() {
  try {
    const users = await prisma.userProfile.findMany({
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Update lead/contact status
 */
export async function updateContactStatus(
  contactId: string,
  status: string,
  notes?: string
): Promise<boolean> {
  try {
    await prisma.contactSubmission.update({
      where: { id: contactId },
      data: {
        status,
        ...(notes ? { notes } : {}),
        ...(status === 'converted' || status === 'customer' ? { responseAt: new Date() } : {}),
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating contact status:', error);
    return false;
  }
}

/**
 * Get contact/lead by ID
 */
export async function getContactById(contactId: string) {
  try {
    const contact = await prisma.contactSubmission.findUnique({
      where: { id: contactId },
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

    return contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    return null;
  }
}
