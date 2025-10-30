import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db, type Product } from '../db/database';
import {
  requestNotificationPermission,
  isNotificationEnabled,
  checkAndNotifyExpiredProducts,
} from '../services/notificationService';

// Mock the Notification API
const mockNotification = vi.fn();
const mockRequestPermission = vi.fn();

beforeEach(() => {
  // Setup Notification mock
  global.Notification = mockNotification as any;
  global.Notification.permission = 'default';
  global.Notification.requestPermission = mockRequestPermission;
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear database
  return db.products.clear();
});

afterEach(() => {
  vi.clearAllMocks();
  return db.products.clear();
});

describe('Notification Service', () => {
  describe('requestNotificationPermission', () => {
    it('should return true if permission is already granted', async () => {
      global.Notification.permission = 'granted';
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(true);
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should request permission if not granted', async () => {
      global.Notification.permission = 'default';
      mockRequestPermission.mockResolvedValue('granted');
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should return false if permission is denied', async () => {
      global.Notification.permission = 'denied';
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(false);
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should return false if user denies permission', async () => {
      global.Notification.permission = 'default';
      mockRequestPermission.mockResolvedValue('denied');
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(false);
      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });

  describe('isNotificationEnabled', () => {
    it('should return true when Notification API exists and permission is granted', () => {
      global.Notification.permission = 'granted';
      
      const result = isNotificationEnabled();
      
      expect(result).toBe(true);
    });

    it('should return false when permission is not granted', () => {
      global.Notification.permission = 'default';
      
      const result = isNotificationEnabled();
      
      expect(result).toBe(false);
    });
  });

  describe('checkAndNotifyExpiredProducts', () => {
    beforeEach(() => {
      global.Notification.permission = 'granted';
      mockNotification.mockImplementation(function(title: string, options: NotificationOptions) {
        return {
          title,
          ...options,
          close: vi.fn(),
          onclick: null,
        };
      });
    });

    it('should not send notifications if permission is not granted', async () => {
      global.Notification.permission = 'default';
      
      const expiredProduct: Omit<Product, 'id'> = {
        name: 'Expired Product',
        category: 'Makeup',
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.products.add(expiredProduct as Product);
      await checkAndNotifyExpiredProducts();
      
      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should send notification for expired product', async () => {
      const expiredProduct: Omit<Product, 'id'> = {
        name: 'Expired Lipstick',
        category: 'Makeup - Lips',
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.products.add(expiredProduct as Product);
      await checkAndNotifyExpiredProducts();
      
      expect(mockNotification).toHaveBeenCalledWith(
        expect.stringContaining('Expired'),
        expect.objectContaining({
          body: expect.stringContaining('Expired Lipstick'),
        })
      );
    });

    it('should send notification for product expiring within 7 days', async () => {
      const expiringProduct: Omit<Product, 'id'> = {
        name: 'Expiring Mascara',
        category: 'Makeup - Eyes',
        expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.products.add(expiringProduct as Product);
      await checkAndNotifyExpiredProducts();
      
      expect(mockNotification).toHaveBeenCalledWith(
        expect.stringContaining('Expiring Soon'),
        expect.objectContaining({
          body: expect.stringContaining('Expiring Mascara'),
        })
      );
    });

    it('should not send notification for products expiring in more than 7 days', async () => {
      const futureProduct: Omit<Product, 'id'> = {
        name: 'Future Product',
        category: 'Makeup',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.products.add(futureProduct as Product);
      await checkAndNotifyExpiredProducts();
      
      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should not send duplicate notifications within 24 hours', async () => {
      const expiredProduct: Omit<Product, 'id'> = {
        name: 'Expired Product',
        category: 'Makeup',
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.products.add(expiredProduct as Product);
      
      // First check should send notification
      await checkAndNotifyExpiredProducts();
      expect(mockNotification).toHaveBeenCalledTimes(1);
      
      // Second check within 24 hours should not send notification
      await checkAndNotifyExpiredProducts();
      expect(mockNotification).toHaveBeenCalledTimes(1);
    });
  });
});
