
// analytics.js - ImageRefresh Analytics Tracking System
const ImageRefreshAnalytics = {
  // Track category/subcategory selection
  trackStyleSelection(category, subcategory) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'style_selected', {
        'event_category': 'styles',
        'category': category,
        'subcategory': subcategory,
        'combination': `${category} > ${subcategory}`,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Style selected - ${category} > ${subcategory}`);
    }
  },

  // Track image upload
  trackImageUpload(fileType, fileSize) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_uploaded', {
        'event_category': 'user_journey',
        'file_type': fileType,
        'file_size_kb': Math.round(fileSize / 1024),
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Image uploaded - ${fileType}, ${Math.round(fileSize / 1024)}KB`);
    }
  },

  // Track download
  trackDownload(category, style) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_downloaded', {
        'event_category': 'conversions',
        'category': category,
        'style': style,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Image downloaded - ${category}, ${style}`);
    }
  },

  // Track errors
  trackError(errorType, details) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error_occurred', {
        'event_category': 'errors',
        'error_type': errorType,
        'error_details': details,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Error tracked - ${errorType}: ${details}`);
    }
  },

  // Track page navigation
  trackPageView(pageName) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        'event_category': 'navigation',
        'page_name': pageName,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Page view - ${pageName}`);
    }
  },

  // Track transformation start
  trackTransformationStart(style, hasUpload) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'transformation_started', {
        'event_category': 'user_journey',
        'style': style,
        'has_upload': hasUpload,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Transformation started - ${style}, Upload: ${hasUpload}`);
    }
  },

  // Track transformation completion
  trackTransformationComplete(style, processingTime) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'transformation_completed', {
        'event_category': 'user_journey',
        'style': style,
        'processing_time_seconds': processingTime,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Transformation completed - ${style}, ${processingTime}s`);
    }
  },

  // Track credit usage
  trackCreditUsage(creditType, amount) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'credit_used', {
        'event_category': 'monetization',
        'credit_type': creditType, // 'free' or 'paid'
        'amount': amount,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Credit used - ${creditType}, Amount: ${amount}`);
    }
  },

  // Track purchase intent
  trackPurchaseIntent(packageType) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase_intent', {
        'event_category': 'monetization',
        'package_type': packageType,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Purchase intent - ${packageType}`);
    }
  },

  // Track social sharing
  trackSocialShare(platform, contentType) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'social_share', {
        'event_category': 'engagement',
        'platform': platform,
        'content_type': contentType,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Social share - ${platform}, ${contentType}`);
    }
  },

  // Track user session time
  trackSessionTime(timeOnPageSeconds) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'session_time', {
        'event_category': 'engagement',
        'time_on_page': timeOnPageSeconds,
        'page_location': window.location.href
      });
      
      console.log(`📊 Analytics: Session time - ${timeOnPageSeconds}s`);
    }
  }
};

// Initialize session tracking
let sessionStartTime = Date.now();

// Track session time on page unload
window.addEventListener('beforeunload', () => {
  const timeOnPage = Math.round((Date.now() - sessionStartTime) / 1000);
  ImageRefreshAnalytics.trackSessionTime(timeOnPage);
});

// Export if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageRefreshAnalytics;
}

// Global availability
if (typeof window !== 'undefined') {
  window.ImageRefreshAnalytics = ImageRefreshAnalytics;
}
