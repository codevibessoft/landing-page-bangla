/**
 * Facebook Data Layer & Meta Pixel Tracking Manager
 * Designed to optimize Facebook/Meta Pixel conversion match rates with proper
 * event parameters and custom GTM layout-conforming dataLayer pushes.
 */

// Global type declaration for the browser window properties
declare global {
  interface Window {
    dataLayer: any[];
    fbq: any;
    _fbq: any;
  }
}

// Logs for testing/inspection in the Admin Panel
export interface TrackerLogEntry {
  timestamp: string;
  eventName: string;
  payload: any;
}

// Dynamic state to hold logs for verification
const trackingLogs: TrackerLogEntry[] = [];
let onLogAddedCallback: ((log: TrackerLogEntry) => void) | null = null;

export function registerLogCallback(callback: (log: TrackerLogEntry) => void) {
  onLogAddedCallback = callback;
}

function logTrackingEvent(eventName: string, payload: any) {
  const newLog: TrackerLogEntry = {
    timestamp: new Date().toLocaleTimeString(),
    eventName,
    payload
  };
  trackingLogs.unshift(newLog);
  // Keep up to 50 logs
  if (trackingLogs.length > 50) {
    trackingLogs.pop();
  }
  if (onLogAddedCallback) {
    onLogAddedCallback(newLog);
  }
  console.log(`[Tracker Log] ${eventName}:`, payload);
}

export function getTrackingLogs(): TrackerLogEntry[] {
  return [...trackingLogs];
}

// Get the current persistent Pixel ID
export function getMetaPixelId(): string {
  return localStorage.getItem("krill_meta_pixel_id") || ((import.meta as any).env?.VITE_META_PIXEL_ID as string) || "884561029348576"; // High fidelity pre-filled placeholder
}

// Set a new Meta Pixel ID and re-initialize
export function setMetaPixelId(pixelId: string) {
  localStorage.setItem("krill_meta_pixel_id", pixelId);
  initializeMetaPixel();
}

/**
 * Cleanly injects the Meta Pixel JS SDK into the document head dynamically,
 * adhering to high performance and standards.
 */
export function initializeMetaPixel() {
  const pixelId = getMetaPixelId();
  if (!pixelId) return;

  // Initialize dataLayer immediately
  window.dataLayer = window.dataLayer || [];

  // Standard GTM PageView compatibility
  if (!window.dataLayer.some((item: any) => item.event === "gtm.js")) {
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });
  }

  // Prevent duplicate insertion
  if (document.getElementById("meta-pixel-script")) {
    // If the pixel ID changed, we can trigger an updated init call
    if (typeof window.fbq === "function") {
      window.fbq("init", pixelId);
      window.fbq("track", "PageView");
      logTrackingEvent("Re-Initialized Pixel", { pixelId });
    }
    return;
  }

  // standard Facebook Pixel script tracking initialization snippet
  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    t.id = "meta-pixel-script";
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  if (typeof window.fbq === "function") {
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
    logTrackingEvent("Initialized Pixel & PageView", { pixelId });
  }
}

/**
 * Track PageView event
 */
export function trackPageView() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "PageView",
    page_path: window.location.pathname,
    page_title: document.title,
    timestamp: new Date().toISOString()
  });

  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
  logTrackingEvent("PageView", { path: window.location.pathname });
}

/**
 * Track ViewContent when a user reviews the product listing/information
 */
export function trackViewContent(productName: string, price: number) {
  const pixelId = getMetaPixelId();
  window.dataLayer = window.dataLayer || [];
  const eventData = {
    event: "ViewContent",
    pixelId,
    ecommerce: {
      currency: "BDT",
      value: price,
      items: [
        {
          item_name: productName,
          price: price,
          quantity: 1,
          item_category: "Supplements"
        }
      ]
    }
  };

  window.dataLayer.push(eventData);

  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: productName,
      content_category: "Supplements",
      value: price,
      currency: "BDT"
    });
  }
  logTrackingEvent("ViewContent", eventData);
}

/**
 * Track InitiateCheckout when the customer scrolls to or starts entering details in the checkout form
 */
export function trackInitiateCheckout(productName: string, price: number) {
  const pixelId = getMetaPixelId();
  window.dataLayer = window.dataLayer || [];
  const eventData = {
    event: "InitiateCheckout",
    pixelId,
    ecommerce: {
      currency: "BDT",
      value: price,
      items: [
        {
          item_name: productName,
          price: price,
          quantity: 1
        }
      ]
    }
  };

  window.dataLayer.push(eventData);

  if (typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      content_name: productName,
      value: price,
      currency: "BDT"
    });
  }
  logTrackingEvent("InitiateCheckout", eventData);
}

/**
 * Track Customer ordering purchase with customer data for optimized Meta customer matchmaking performance
 */
export function trackPurchase(
  orderId: string,
  productName: string,
  totalAmount: number,
  phone: string,
  name: string
) {
  const pixelId = getMetaPixelId();
  window.dataLayer = window.dataLayer || [];

  // Basic normalization for maximum Match Rate (raw and basic helper matching formatted fields)
  // Clean phone input to keep only digits
  const cleanPhone = phone.replace(/[^\d]/g, "");

  const eventData = {
    event: "Purchase",
    pixelId,
    transaction_id: orderId,
    ecommerce: {
      transaction_id: orderId,
      value: totalAmount,
      currency: "BDT",
      items: [
        {
          item_name: productName,
          price: totalAmount,
          quantity: 1
        }
      ]
    },
    user_data: {
      external_id: orderId,
      phone_normalized: cleanPhone,
      fn: name // First name / full name parameter
    }
  };

  window.dataLayer.push(eventData);

  if (typeof window.fbq === "function") {
    // Pass user details to improve matching probability scoring
    window.fbq("track", "Purchase", {
      content_name: productName,
      value: totalAmount,
      currency: "BDT",
      id: orderId,
      content_type: "product",
      predicted_ltv: totalAmount
    }, {
      eventID: orderId // For deduplication in Conversion API (CAPI) setups
    });
  }
  logTrackingEvent("Purchase", eventData);
}
