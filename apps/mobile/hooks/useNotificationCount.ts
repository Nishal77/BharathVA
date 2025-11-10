import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getUnreadCount } from '../services/api/notificationService';
import { webSocketService, NotificationEvent } from '../services/api/websocketService';

const POLL_INTERVAL = 60000; // 60 seconds
const FOCUS_REFRESH_DELAY = 500; // 500ms delay after focus

export function useNotificationCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const wsConnectedRef = useRef<boolean>(false);
  const isNotificationsTabActiveRef = useRef<boolean>(false); // Track if notifications tab is currently active

  const fetchCount = useCallback(async () => {
    if (isNotificationsTabActiveRef.current) {
      return;
    }
    
    try {
      const response = await getUnreadCount();
      
      if (response.success && response.data) {
        if (isMountedRef.current) {
          const newCount = response.data.count;
          setCount(prevCount => {
            if (isNotificationsTabActiveRef.current) {
              return prevCount;
            }
            return Math.max(prevCount, newCount);
          });
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          setError(response.error?.message || 'Failed to fetch notification count');
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Unexpected error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const initialFetch = useCallback(async () => {
    if (isNotificationsTabActiveRef.current) {
      return;
    }
    
    try {
      const response = await getUnreadCount();
      
      if (response.success && response.data) {
        if (isMountedRef.current) {
          setCount(response.data.count);
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          setError(response.error?.message || 'Failed to fetch notification count');
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Unexpected error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    initialFetch();

    return () => {
      isMountedRef.current = false;
    };
  }, [initialFetch]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current && !isNotificationsTabActiveRef.current) {
        fetchCount();
      }
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchCount]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isMountedRef.current && !isNotificationsTabActiveRef.current) {
        setTimeout(() => {
          if (isMountedRef.current && !isNotificationsTabActiveRef.current) {
            fetchCount();
          }
        }, FOCUS_REFRESH_DELAY);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchCount]);

  useEffect(() => {
    const handleNotificationCreated = (event: NotificationEvent) => {
      if (isMountedRef.current && event.unreadCount !== undefined) {
        setCount(prevCount => {
          const newCount = event.unreadCount!;
          if (isNotificationsTabActiveRef.current && prevCount === 0) {
            return 0;
          }
          return Math.max(prevCount, newCount);
        });
        setError(null);
        setLoading(false);
      }
    };

    const handleCountUpdated = (event: NotificationEvent) => {
      if (isMountedRef.current && event.unreadCount !== undefined) {
        setCount(prevCount => {
          const newCount = event.unreadCount!;
          if (isNotificationsTabActiveRef.current && prevCount === 0) {
            return 0;
          }
          return Math.max(prevCount, newCount);
        });
        setError(null);
        setLoading(false);
      }
    };

    const handleConnectionEstablished = () => {
      wsConnectedRef.current = true;
      if (!isNotificationsTabActiveRef.current) {
        fetchCount();
      }
    };

    const handleConnectionClosed = () => {
      wsConnectedRef.current = false;
    };

    const handleError = (error: any) => {
      console.error('WebSocket error in notification count hook:', error);
    };

    webSocketService.connect({
      onNotificationCreated: handleNotificationCreated,
      onNotificationCountUpdated: handleCountUpdated,
      onConnectionEstablished: handleConnectionEstablished,
      onConnectionClosed: handleConnectionClosed,
      onError: handleError,
    });

    wsConnectedRef.current = true;

    return () => {
      wsConnectedRef.current = false;
    };
  }, [fetchCount]);

  const resetCount = useCallback(() => {
    if (isMountedRef.current) {
      setCount(0);
      setError(null);
    }
  }, []);

  const setNotificationsTabActive = useCallback((active: boolean) => {
    isNotificationsTabActiveRef.current = active;
    resetCount();
  }, [resetCount]);

  return {
    count,
    loading,
    error,
    refresh: fetchCount,
    resetCount,
    setNotificationsTabActive,
  };
}
