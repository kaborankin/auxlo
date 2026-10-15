// A/B Testing utilities for variant management and analytics tracking

export type ABVariant = 'default' | 'direct' | 'creative';

export interface ABTestEvent {
  variant: ABVariant;
  action: 'view' | 'click' | 'submit';
  element: string;
  timestamp: number;
}

// Track A/B test events (integrate with your analytics)
export function trackABTestEvent(event: ABTestEvent): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[A/B Test]', event);
  }

  // Send to Google Analytics (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: 'AB_Test',
      event_label: `${event.variant}_${event.element}`,
      value: event.timestamp,
    });
  }

  // Send to other analytics platforms here
  // Example: Plausible, Mixpanel, Segment, etc.
}

// Track page view with variant
export function trackVariantView(variant: ABVariant, page: string): void {
  trackABTestEvent({
    variant,
    action: 'view',
    element: page,
    timestamp: Date.now(),
  });
}

// Track CTA click with variant
export function trackVariantClick(variant: ABVariant, ctaLabel: string): void {
  trackABTestEvent({
    variant,
    action: 'click',
    element: ctaLabel,
    timestamp: Date.now(),
  });
}

// Track form submission with variant
export function trackVariantSubmit(variant: ABVariant, formType: string): void {
  trackABTestEvent({
    variant,
    action: 'submit',
    element: formType,
    timestamp: Date.now(),
  });
}

// Get variant from URL query parameter
export function getVariantFromURL(searchParams: URLSearchParams): ABVariant {
  const variant = searchParams.get('variant');
  
  if (variant === 'direct' || variant === 'creative') {
    return variant;
  }
  
  return 'default';
}

// Get variant display name
export function getVariantName(variant: ABVariant): string {
  switch (variant) {
    case 'direct':
      return 'Direct (Google Ads)';
    case 'creative':
      return 'Creative (Behance/Dribbble)';
    default:
      return 'Custom Hybrid';
  }
}
