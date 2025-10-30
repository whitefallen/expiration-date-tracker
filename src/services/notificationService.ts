import { db, type Product } from '../db/database';

export interface NotificationState {
  productId: number;
  lastNotified: Date;
}

const NOTIFICATION_STORAGE_KEY = 'expiryNotifications';

/**
 * Get the stored notification states from localStorage
 */
const getNotificationStates = (): Map<number, Date> => {
  const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!stored) return new Map();
  
  try {
    const parsed = JSON.parse(stored) as NotificationState[];
    return new Map(parsed.map(s => [s.productId, new Date(s.lastNotified)]));
  } catch {
    return new Map();
  }
};

/**
 * Save notification states to localStorage
 */
const saveNotificationStates = (states: Map<number, Date>) => {
  const statesArray: NotificationState[] = Array.from(states.entries()).map(([productId, lastNotified]) => ({
    productId,
    lastNotified,
  }));
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(statesArray));
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Check if notifications are supported and permitted
 */
export const isNotificationEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Send a notification for an expired or expiring product
 */
const sendProductNotification = (product: Product, isExpired: boolean) => {
  if (!isNotificationEnabled()) return;

  const title = isExpired ? '🔴 Product Expired!' : '⚠️ Product Expiring Soon!';
  const body = isExpired
    ? `${product.name} has expired on ${new Date(product.expirationDate).toLocaleDateString()}`
    : `${product.name} will expire on ${new Date(product.expirationDate).toLocaleDateString()}`;

  const options: NotificationOptions = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `product-${product.id}`,
    requireInteraction: isExpired, // Keep expired notifications until dismissed
    data: {
      productId: product.id,
      url: '/products',
    },
  };

  const notification = new Notification(title, options);

  notification.onclick = () => {
    window.focus();
    if (options.data?.url) {
      window.location.href = options.data.url;
    }
    notification.close();
  };
};

/**
 * Check all products and send notifications for expired or expiring ones
 */
export const checkAndNotifyExpiredProducts = async () => {
  if (!isNotificationEnabled()) return;

  try {
    const products = await db.products.toArray();
    const now = new Date();
    const notificationStates = getNotificationStates();
    const updatedStates = new Map(notificationStates);

    for (const product of products) {
      const expirationDate = new Date(product.expirationDate);
      const diffTime = expirationDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if we should notify about this product
      const lastNotified = notificationStates.get(product.id!);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Only notify once per day for each product
      if (lastNotified && lastNotified > oneDayAgo) {
        continue;
      }

      // Notify for expired products
      if (diffDays < 0) {
        sendProductNotification(product, true);
        updatedStates.set(product.id!, now);
      }
      // Notify for products expiring within 7 days
      else if (diffDays <= 7) {
        sendProductNotification(product, false);
        updatedStates.set(product.id!, now);
      }
    }

    // Clean up old notification states (remove products that no longer exist)
    const productIds = new Set(products.map(p => p.id).filter(id => id !== undefined));
    for (const [productId] of updatedStates) {
      if (!productIds.has(productId)) {
        updatedStates.delete(productId);
      }
    }

    saveNotificationStates(updatedStates);
  } catch (error) {
    console.error('Failed to check and notify expired products:', error);
  }
};

/**
 * Initialize notification checking with periodic intervals
 */
export const initializeNotificationService = () => {
  // Check immediately on initialization
  checkAndNotifyExpiredProducts();

  // Check every 6 hours
  const intervalId = setInterval(() => {
    checkAndNotifyExpiredProducts();
  }, 6 * 60 * 60 * 1000);

  // Return cleanup function
  return () => clearInterval(intervalId);
};
