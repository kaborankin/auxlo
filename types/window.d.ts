// types/window.d.ts
export {};

declare global {
  interface Window {
    SITE_ORG?: string;
    trackPageView?: () => void;
    trackEvent?: (eventName: string, data?: Record<string, any>) => void;
  }
}
