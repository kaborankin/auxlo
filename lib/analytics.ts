import { Storage } from '@google-cloud/storage';

// Initialize storage
let storage: Storage | null = null;
let bucket: any = null;

function initializeGCS() {
  if (storage && bucket) return { storage, bucket };
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.PROJECT_ID;
  const bucketName = process.env.GCS_BUCKET_NAME || process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

  if (!bucketName) {
    console.warn('GCS bucket not configured. Data will not be persisted to cloud storage.');
    // Return mock objects for development
    return {
      storage: null,
      bucket: {
        file: () => ({
          save: async () => {},
          exists: async () => [false],
          download: async () => ['{}'],
          delete: async () => {},
          createWriteStream: () => {
            const stream = require('stream').PassThrough();
            setTimeout(() => stream.emit('finish'), 100);
            return stream;
          },
          makePublic: async () => {},
          getSignedUrl: async () => ['https://placeholder-url']
        }),
        getFiles: async () => [[]]
      }
    };
  }

  try {
    // Use Cloud Run's default service account authentication
    storage = new Storage({ projectId });
    bucket = storage.bucket(bucketName);
    console.log(`GCS initialized: project=${projectId}, bucket=${bucketName}`);
  } catch (error) {
    console.error('Failed to initialize GCS:', error);
    // Return mock objects if initialization fails
    return {
      storage: null,
      bucket: {
        file: () => ({
          save: async () => {},
          exists: async () => [false],
          download: async () => ['{}'],
          delete: async () => {},
          createWriteStream: () => {
            const stream = require('stream').PassThrough();
            setTimeout(() => stream.emit('finish'), 100);
            return stream;
          },
          makePublic: async () => {},
          getSignedUrl: async () => ['https://placeholder-url']
        }),
        getFiles: async () => [[]]
      }
    };
  }
  
  return { storage, bucket };
}

// Lead Analytics Types
export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  type: 'studio_guide' | 'contact_form' | 'demo_request' | 'general_inquiry' | 'newsletter';
  source: string; // URL or page where lead was generated
  variant?: 'hybrid' | 'direct' | 'creative'; // A/B test variant
  userAgent?: string;
  ip?: string;
  fileURL?: string;
  createdAt: string;
  convertedAt?: string; // When they became a customer
  conversionValue?: number; // Revenue value if converted
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  tags?: string[];
  notes?: string;
}

export interface AnalyticsData {
  date: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  sources: Record<string, number>;
  types: Record<string, number>;
  variants?: Record<string, { leads: number; conversions: number; conversionRate: number }>;
  revenue?: number;
}

// Upload file buffer to GCS
export async function uploadBuffer(buffer: Buffer, destination: string, contentType?: string) {
  const { bucket } = initializeGCS();
  const file = bucket.file(destination);
  const stream = file.createWriteStream({ 
    metadata: { contentType },
    resumable: false
  });

  return new Promise<string>((resolve, reject) => {
    stream.on('error', (err: Error) => reject(err));
    stream.on('finish', async () => {
      try {
        // Return signed URL for security
        const expiresMs = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        const [signedUrl] = await file.getSignedUrl({ 
          action: 'read', 
          expires: expiresMs, 
          version: 'v4' 
        });
        resolve(signedUrl);
      } catch (err) {
        // Fallback to public URL
        try {
          await file.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
          resolve(publicUrl);
        } catch (e) {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
          resolve(publicUrl);
        }
      }
    });
    stream.end(buffer);
  });
}

// Save lead data to GCS as JSON
export async function saveLeadData(leadData: LeadData): Promise<void> {
  try {
    const { bucket } = initializeGCS();
    
    if (!bucket || typeof bucket.file !== 'function') {
      console.warn('GCS not available, skipping lead data save for:', leadData.id);
      return;
    }
    
    const fileName = `leads/data/${leadData.createdAt.split('T')[0]}/${leadData.id}.json`;
    const file = bucket.file(fileName);
    
    const content = JSON.stringify(leadData, null, 2);
    await file.save(content, {
      metadata: {
        contentType: 'application/json'
      }
    });
    
    console.log('Lead data saved:', leadData.id);
  } catch (error) {
    console.error('Error saving lead data:', error);
    // Don't throw - allow the operation to continue even if GCS save fails
  }
}

// Get lead data by ID
export async function getLeadData(leadId: string): Promise<LeadData | null> {
  const { bucket } = initializeGCS();
  
  // Search in recent dates (last 30 days)
  const dates = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  for (const date of dates) {
    try {
      const file = bucket.file(`leads/data/${date}/${leadId}.json`);
      const [exists] = await file.exists();
      if (exists) {
        const [content] = await file.download();
        return JSON.parse(content.toString());
      }
    } catch (error) {
      // Continue searching other dates
    }
  }
  
  return null;
}

// Get leads for a specific date range
export async function getLeadsInDateRange(startDate: string, endDate: string): Promise<LeadData[]> {
  const { bucket } = initializeGCS();
  const leads: LeadData[] = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Get all dates in range
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    try {
      const [files] = await bucket.getFiles({
        prefix: `leads/data/${dateStr}/`,
        delimiter: '/'
      });
      
      for (const file of files) {
        if (file.name.endsWith('.json')) {
          try {
            const [content] = await file.download();
            const leadData = JSON.parse(content.toString());
            leads.push(leadData);
          } catch (error) {
            console.warn(`Failed to parse lead file ${file.name}:`, error);
          }
        }
      }
    } catch (error) {
      // Date folder doesn't exist, continue
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Update lead status (for conversion tracking)
export async function updateLeadStatus(
  leadId: string, 
  status: LeadData['status'], 
  conversionValue?: number,
  notes?: string
): Promise<boolean> {
  const leadData = await getLeadData(leadId);
  if (!leadData) {
    return false;
  }
  
  leadData.status = status;
  if (status === 'converted') {
    leadData.convertedAt = new Date().toISOString();
    leadData.conversionValue = conversionValue;
  }
  if (notes) {
    leadData.notes = notes;
  }
  
  await saveLeadData(leadData);
  return true;
}

// Generate analytics data
export async function generateAnalytics(startDate: string, endDate: string): Promise<AnalyticsData[]> {
  const leads = await getLeadsInDateRange(startDate, endDate);
  const analyticsMap = new Map<string, AnalyticsData>();
  
  // Group leads by date
  leads.forEach(lead => {
    const date = lead.createdAt.split('T')[0];
    
    if (!analyticsMap.has(date)) {
      analyticsMap.set(date, {
        date,
        leads: 0,
        conversions: 0,
        conversionRate: 0,
        sources: {},
        types: {},
        variants: {},
        revenue: 0
      });
    }
    
    const analytics = analyticsMap.get(date)!;
    analytics.leads++;
    
    // Track conversions
    if (lead.status === 'converted') {
      analytics.conversions++;
      analytics.revenue = (analytics.revenue || 0) + (lead.conversionValue || 0);
    }
    
    // Track sources
    analytics.sources[lead.source] = (analytics.sources[lead.source] || 0) + 1;
    
    // Track types
    analytics.types[lead.type] = (analytics.types[lead.type] || 0) + 1;
    
    // Track A/B test variants
    if (lead.variant) {
      if (!analytics.variants![lead.variant]) {
        analytics.variants![lead.variant] = { leads: 0, conversions: 0, conversionRate: 0 };
      }
      analytics.variants![lead.variant].leads++;
      if (lead.status === 'converted') {
        analytics.variants![lead.variant].conversions++;
      }
    }
  });
  
  // Calculate conversion rates
  analyticsMap.forEach(analytics => {
    analytics.conversionRate = analytics.leads > 0 ? 
      Number((analytics.conversions / analytics.leads * 100).toFixed(2)) : 0;
    
    // Calculate variant-specific conversion rates
    if (analytics.variants) {
      Object.keys(analytics.variants).forEach(variant => {
        const variantData = analytics.variants![variant];
        variantData.conversionRate = variantData.leads > 0 ?
          Number((variantData.conversions / variantData.leads * 100).toFixed(2)) : 0;
      });
    }
  });
  
  return Array.from(analyticsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Save daily analytics summary
export async function saveDailyAnalytics(date: string): Promise<void> {
  const analytics = await generateAnalytics(date, date);
  if (analytics.length > 0) {
    const { bucket } = initializeGCS();
    const file = bucket.file(`analytics/daily/${date}.json`);
    await file.save(JSON.stringify(analytics[0], null, 2), {
      metadata: { contentType: 'application/json' }
    });
  }
}

// Export functions for file operations
export async function deleteFile(filePath: string) {
  const { bucket } = initializeGCS();
  const file = bucket.file(filePath);
  await file.delete({ ignoreNotFound: true });
}

export async function listFiles(prefix: string = '') {
  const { bucket } = initializeGCS();
  const [files] = await bucket.getFiles({ prefix });
  return files.map((f: any) => ({ 
    name: f.name, 
    url: `https://storage.googleapis.com/${bucket.name}/${f.name}` 
  }));
}

export default function getDefaultBucket() {
  const { bucket } = initializeGCS();
  return bucket;
}