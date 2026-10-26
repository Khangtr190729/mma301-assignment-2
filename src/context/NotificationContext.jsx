import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [isGranted, setIsGranted] = useState(false);

  // Check initial permission status
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      const res = await notificationService.checkPermission();
      if (isMounted) {
        setPermissionStatus(res.status);
        setIsGranted(res.granted);
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Request permission from user
   */
  const requestPermission = useCallback(async () => {
    const res = await notificationService.requestPermission();
    setPermissionStatus(res.status);
    setIsGranted(res.granted);
    return res;
  }, []);

  /**
   * Trigger notification for order completion
   */
  const triggerOrderNotification = useCallback(
    async ({ orderId, totalAmount, itemCount }) => {
      return await notificationService.sendOrderNotification({
        orderId,
        totalAmount,
        itemCount,
      });
    },
    []
  );

  /**
   * Send test custom notification
   */
  const triggerCustomNotification = useCallback(async (title, message) => {
    return await notificationService.sendCustomNotification(title, message);
  }, []);

  const value = useMemo(
    () => ({
      permissionStatus,
      isGranted,
      requestPermission,
      triggerOrderNotification,
      triggerCustomNotification,
    }),
    [
      permissionStatus,
      isGranted,
      requestPermission,
      triggerOrderNotification,
      triggerCustomNotification,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
