import { Storage } from '@google-cloud/storage';

// Booking data types for storage
export interface BookingData {
  id: string;
  service: {
    id: string;
    title: string;
    subtitle: string;
    duration: string;
    price: number;
    description?: string;
  };
  studio: {
    id: string;
    name: string;
    equipment: string[];
  };
  date: string;
  time: string;
  addOns: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentInfo?: {
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'quote_required';
    amount: number;
    paymentMethod?: string;
    transactionId?: string;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'quote_required';
  createdAt: string;
  updatedAt: string;
  uploadedFiles?: string[];
  notes?: string;
  remindersSent?: number;
  source?: string; // Where the booking came from
  liveEventDetails?: any; // Store comprehensive live event requirements
  digitalServiceDetails?: any; // Store comprehensive digital service requirements
}

export interface BookingAnalytics {
  date: string;
  totalBookings: number;
  totalRevenue: number;
  bookingsByService: Record<string, number>;
  bookingsByStudio: Record<string, number>;
  bookingsByStatus: Record<string, number>;
  averageBookingValue: number;
  conversionRate?: number;
}

// Initialize GCS
let storage: Storage | null = null;
let bucket: any = null;

function initializeGCS() {
  if (storage && bucket) return { storage, bucket };
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.PROJECT_ID;
  const bucketName = process.env.GCS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable is required');
  }

  storage = new Storage({ projectId });
  bucket = storage.bucket(bucketName);
  
  return { storage, bucket };
}

// Save booking data to GCS
export async function saveBookingData(bookingData: BookingData): Promise<void> {
  const { bucket } = initializeGCS();
  const fileName = `bookings/data/${bookingData.date}/${bookingData.id}.json`;
  const file = bucket.file(fileName);
  
  const content = JSON.stringify(bookingData, null, 2);
  await file.save(content, {
    metadata: {
      contentType: 'application/json'
    }
  });
}

// Get booking by ID
export async function getBookingData(bookingId: string): Promise<BookingData | null> {
  const { bucket } = initializeGCS();
  
  // Search in recent dates (last 90 days for bookings)
  const dates = [];
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  for (const date of dates) {
    try {
      const file = bucket.file(`bookings/data/${date}/${bookingId}.json`);
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

// Get bookings for date range
export async function getBookingsInDateRange(startDate: string, endDate: string): Promise<BookingData[]> {
  const { bucket } = initializeGCS();
  const bookings: BookingData[] = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Try both paths: unified (new) and data (legacy)
    const paths = [`bookings/unified/${dateStr}/`, `bookings/data/${dateStr}/`];
    
    for (const prefix of paths) {
      try {
        const [files] = await bucket.getFiles({
          prefix,
          delimiter: '/'
        });
        
        for (const file of files) {
          if (file.name.endsWith('.json')) {
            try {
              const [content] = await file.download();
              const contentStr = content.toString();
              if (contentStr && contentStr.trim()) {
                const bookingData = JSON.parse(contentStr);
                // Check if we haven't already added this booking (by ID)
                if (bookingData && bookingData.id && !bookings.find(b => b.id === bookingData.id)) {
                  bookings.push(bookingData);
                }
              }
            } catch (error) {
              console.warn(`Failed to parse booking file ${file.name}:`, error);
            }
          }
        }
      } catch (error) {
        // Date folder doesn't exist, continue
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Update booking status
export async function updateBookingStatus(
  bookingId: string,
  status: BookingData['status'],
  notes?: string,
  paymentInfo?: BookingData['paymentInfo']
): Promise<boolean> {
  const bookingData = await getBookingData(bookingId);
  if (!bookingData) {
    return false;
  }
  
  bookingData.status = status;
  bookingData.updatedAt = new Date().toISOString();
  
  if (notes) {
    bookingData.notes = notes;
  }
  
  if (paymentInfo) {
    bookingData.paymentInfo = paymentInfo;
  }
  
  await saveBookingData(bookingData);
  return true;
}

// Generate booking analytics
export async function generateBookingAnalytics(startDate: string, endDate: string): Promise<BookingAnalytics[]> {
  const bookings = await getBookingsInDateRange(startDate, endDate);
  const analyticsMap = new Map<string, BookingAnalytics>();
  
  // Group bookings by date
  bookings.forEach(booking => {
    const date = booking.date; // Booking date, not created date
    
    if (!analyticsMap.has(date)) {
      analyticsMap.set(date, {
        date,
        totalBookings: 0,
        totalRevenue: 0,
        bookingsByService: {},
        bookingsByStudio: {},
        bookingsByStatus: {},
        averageBookingValue: 0
      });
    }
    
    const analytics = analyticsMap.get(date)!;
    analytics.totalBookings++;
    
    // Calculate revenue (only for paid bookings)
    if (booking.paymentInfo?.status === 'paid' || booking.status === 'completed') {
      const revenue = booking.service.price + (booking.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0);
      analytics.totalRevenue += revenue;
    }
    
    // Track by service
    analytics.bookingsByService[booking.service.title] = 
      (analytics.bookingsByService[booking.service.title] || 0) + 1;
    
    // Track by studio
    analytics.bookingsByStudio[booking.studio.name] = 
      (analytics.bookingsByStudio[booking.studio.name] || 0) + 1;
    
    // Track by status
    analytics.bookingsByStatus[booking.status] = 
      (analytics.bookingsByStatus[booking.status] || 0) + 1;
  });
  
  // Calculate averages
  analyticsMap.forEach(analytics => {
    analytics.averageBookingValue = analytics.totalBookings > 0 ? 
      Number((analytics.totalRevenue / analytics.totalBookings).toFixed(2)) : 0;
  });
  
  return Array.from(analyticsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Get today's bookings
export async function getTodaysBookings(): Promise<BookingData[]> {
  const today = new Date().toISOString().split('T')[0];
  return getBookingsInDateRange(today, today);
}

// Get upcoming bookings (next 7 days)
export async function getUpcomingBookings(): Promise<BookingData[]> {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const endDate = nextWeek.toISOString().split('T')[0];
  
  const bookings = await getBookingsInDateRange(today, endDate);
  return bookings.filter(booking => booking.status !== 'cancelled' && booking.status !== 'completed');
}

// Search bookings by customer email or name
export async function searchBookings(query: string): Promise<BookingData[]> {
  const { bucket } = initializeGCS();
  const bookings: BookingData[] = [];
  const searchTerm = query.toLowerCase();
  
  // Search in the last 90 days
  const dates = [];
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  for (const date of dates) {
    try {
      const [files] = await bucket.getFiles({
        prefix: `bookings/data/${date}/`,
        delimiter: '/'
      });
      
      for (const file of files) {
        if (file.name.endsWith('.json')) {
          try {
            const [content] = await file.download();
            const bookingData = JSON.parse(content.toString());
            
            // Search in customer info
            if (
              bookingData.customerInfo.name.toLowerCase().includes(searchTerm) ||
              bookingData.customerInfo.email.toLowerCase().includes(searchTerm) ||
              bookingData.customerInfo.phone.includes(searchTerm) ||
              bookingData.id.toLowerCase().includes(searchTerm)
            ) {
              bookings.push(bookingData);
            }
          } catch (error) {
            // Skip invalid files
          }
        }
      }
    } catch (error) {
      // Continue searching other dates
    }
  }
  
  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}