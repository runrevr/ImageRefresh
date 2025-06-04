
// utils/analytics.ts
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
    console.log(`📊 Analytics: ${eventName}`, parameters);
  }
};

export const trackStyleSelection = (category: string, subcategory: string) => {
  trackEvent('style_selected', {
    event_category: 'styles',
    category,
    subcategory,
    combination: `${category} > ${subcategory}`,
    page_location: window.location.href
  });
};

export const trackImageUpload = (fileType: string, fileSize: number) => {
  trackEvent('image_uploaded', {
    event_category: 'user_journey',
    file_type: fileType,
    file_size_kb: Math.round(fileSize / 1024),
    page_location: window.location.href
  });
};

export const trackDownload = (category: string, style: string) => {
  trackEvent('image_downloaded', {
    event_category: 'conversions',
    category,
    style,
    page_location: window.location.href
  });
};

export const trackTransformationComplete = (style: string, processingTime?: number) => {
  trackEvent('transformation_completed', {
    event_category: 'user_journey',
    style,
    processing_time_seconds: processingTime,
    page_location: window.location.href
  });
};

export const trackCreditUsage = (creditType: 'free' | 'paid', amount: number) => {
  trackEvent('credit_used', {
    event_category: 'monetization',
    credit_type: creditType,
    amount,
    page_location: window.location.href
  });
};

export const trackError = (errorType: string, details: string) => {
  trackEvent('error_occurred', {
    event_category: 'errors',
    error_type: errorType,
    error_details: details,
    page_location: window.location.href
  });
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    event_category: 'navigation',
    page_name: pageName,
    page_location: window.location.href
  });
};
