import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure foreground notification presentation
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (err) {
  console.warn('[NotificationService] setNotificationHandler skipped:', err);
}

/**
 * Service to handle Notification permissions and Business Event triggers
 * Covers requirements R09, TC11, and TC12.
 */
class NotificationService {
  constructor() {
    this.permissionStatus = 'undetermined';
    this.isSupported = Platform.OS !== 'web';
  }

  /**
   * Request notification permission from the user
   * @returns {Promise<{ granted: boolean, status: string }>}
   */
  async requestPermission() {
    if (!this.isSupported) {
      return { granted: false, status: 'unsupported_web' };
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissionStatus = finalStatus;
      const granted = finalStatus === 'granted';
      return { granted, status: finalStatus };
    } catch (error) {
      console.warn('[NotificationService] Request permission failed:', error.message);
      this.permissionStatus = 'error';
      return { granted: false, status: 'error', error: error.message };
    }
  }

  /**
   * Check current permission status without prompting
   * @returns {Promise<{ granted: boolean, status: string }>}
   */
  async checkPermission() {
    if (!this.isSupported) {
      return { granted: false, status: 'unsupported_web' };
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      this.permissionStatus = status;
      return { granted: status === 'granted', status };
    } catch (error) {
      console.warn('[NotificationService] Check permission error:', error.message);
      return { granted: false, status: 'error' };
    }
  }

  /**
   * Trigger Business Notification: Order Confirmation (R09)
   * @param {object} params
   * @param {string} params.orderId
   * @param {number} params.totalAmount
   * @param {number} params.itemCount
   * @returns {Promise<boolean>}
   */
  async sendOrderNotification({ orderId, totalAmount, itemCount }) {
    if (!this.isSupported) return false;

    try {
      const { granted } = await this.checkPermission();
      if (!granted) {
        console.log('[NotificationService] Permission denied, notification suppressed.');
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Đặt hàng thành công',
          body: `Đơn hàng #${orderId} (${itemCount} sản phẩm) trị giá $${totalAmount.toFixed(
            2
          )} đã được xác nhận.`,
          data: { orderId, screen: 'Wishlist' },
          sound: true,
        },
        trigger: null, // deliver immediately
      });
      return true;
    } catch (error) {
      console.warn('[NotificationService] Failed to schedule order notification:', error.message);
      return false;
    }
  }

  /**
   * Trigger Business Notification: Promotional or Wishlist update
   * @param {string} title
   * @param {string} body
   * @returns {Promise<boolean>}
   */
  async sendCustomNotification(title, body) {
    if (!this.isSupported) return false;

    try {
      const { granted } = await this.checkPermission();
      if (!granted) return false;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      });
      return true;
    } catch (error) {
      console.warn('[NotificationService] Failed to send custom notification:', error.message);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
