import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  useColorScheme,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { getGatewayURL } from '../../services/api/environment';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

interface DebugConsoleProps {
  visible: boolean;
  onClose: () => void;
}

export default function DebugConsole({ visible, onClose }: DebugConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (visible) {
      loadAuthStatus();
      loadUserInfo();
      // Capture console logs (this is a simplified version)
      captureLogs();
    }
  }, [visible]);

  const loadAuthStatus = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      setAuthStatus({
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : null,
        refreshTokenPreview: refreshToken ? refreshToken.substring(0, 50) + '...' : null,
      });
    } catch (error) {
      console.log('Error loading auth status:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) return;

      // Decode JWT token to get user info
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      setUserInfo({
        userId: payload.userId || payload.sub,
        email: payload.email,
        username: payload.username,
        exp: payload.exp,
        iat: payload.iat,
      });
    } catch (error) {
      console.log('Error loading user info:', error);
    }
  };

  const captureLogs = () => {
    // This is a simplified log capture
    // In a real implementation, you'd want to intercept console.log calls
    const sampleLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'Debug console opened',
      },
      {
        id: '2',
        timestamp: new Date().toLocaleTimeString(),
        level: 'success',
        message: 'Authentication status loaded',
      },
    ];
    setLogs(sampleLogs);
  };

  const testAuthFlow = async () => {
    try {
      addLog('info', 'Testing authentication flow...');
      
      const baseUrl = getGatewayURL();
      const token = await SecureStore.getItemAsync('accessToken');
      
      if (!token) {
        addLog('error', 'No access token found');
        return;
      }

      addLog('info', 'Access token found, testing validation...');
      
      // Test token validation
      const response = await fetch(`${baseUrl}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        addLog('success', 'Token validation successful');
        const data = await response.json();
        addLog('info', 'Validation response:', data);
      } else {
        addLog('error', `Token validation failed: ${response.status}`);
      }
    } catch (error) {
      addLog('error', 'Auth flow test failed:', error);
    }
  };

  const testFeedCreation = async () => {
    try {
      addLog('info', 'Testing feed creation...');
      
      const baseUrl = getGatewayURL();
      const token = await SecureStore.getItemAsync('accessToken');
      
      if (!token) {
        addLog('error', 'No access token found');
        return;
      }

      // Extract user ID from token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const userId = payload.userId || payload.sub;

      addLog('info', `Creating test feed for user: ${userId}`);

      const response = await fetch(`${baseUrl}/api/feed/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          message: `Test feed from debug console at ${new Date().toLocaleTimeString()}`,
        }),
      });

      if (response.ok) {
        addLog('success', 'Feed creation successful');
        const data = await response.json();
        addLog('info', 'Feed response:', data);
      } else {
        addLog('error', `Feed creation failed: ${response.status}`);
        const errorText = await response.text();
        addLog('error', 'Error response:', errorText);
      }
    } catch (error) {
      addLog('error', 'Feed creation test failed:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const addLog = (level: LogEntry['level'], message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data,
    };
    setLogs(prev => [...prev, newLog]);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return '#4CAF50';
      case 'warn': return '#FF9800';
      case 'error': return '#F44336';
      default: return isDark ? '#E0E0E0' : '#606060';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'checkmark-circle';
      case 'warn': return 'warning';
      case 'error': return 'close-circle';
      default: return 'information-circle';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#333333' : '#E1E5E9' }]}>
          <Text style={[styles.headerTitle, { color: isDark ? '#E0E0E0' : '#000000' }]}>
            Debug Console
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDark ? '#E0E0E0' : '#606060'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Auth Status */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#F8F9FA' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#E0E0E0' : '#606060' }]}>
              Authentication Status
            </Text>
            {authStatus ? (
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <Text style={[styles.statusLabel, { color: isDark ? '#A9A9A9' : '#A0A0A0' }]}>
                    Access Token
                  </Text>
                  <Text style={[styles.statusValue, { color: authStatus.hasAccessToken ? '#4CAF50' : '#F44336' }]}>
                    {authStatus.hasAccessToken ? 'Present' : 'Missing'}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={[styles.statusLabel, { color: isDark ? '#A9A9A9' : '#A0A0A0' }]}>
                    Refresh Token
                  </Text>
                  <Text style={[styles.statusValue, { color: authStatus.hasRefreshToken ? '#4CAF50' : '#F44336' }]}>
                    {authStatus.hasRefreshToken ? 'Present' : 'Missing'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.loadingText, { color: isDark ? '#A9A9A9' : '#A0A0A0' }]}>
                Loading...
              </Text>
            )}
          </View>

          {/* User Info */}
          {userInfo && (
            <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#F8F9FA' }]}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#E0E0E0' : '#606060' }]}>
                User Information
              </Text>
              <View style={styles.userInfo}>
                <Text style={[styles.userInfoText, { color: isDark ? '#E0E0E0' : '#000000' }]}>
                  User ID: {userInfo.userId}
                </Text>
                <Text style={[styles.userInfoText, { color: isDark ? '#E0E0E0' : '#000000' }]}>
                  Email: {userInfo.email}
                </Text>
                <Text style={[styles.userInfoText, { color: isDark ? '#E0E0E0' : '#000000' }]}>
                  Username: {userInfo.username}
                </Text>
              </View>
            </View>
          )}

          {/* Test Buttons */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#F8F9FA' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#E0E0E0' : '#606060' }]}>
              Test Functions
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: isDark ? '#1DA1F2' : '#007AFF' }]}
                onPress={testAuthFlow}
              >
                <Text style={styles.testButtonText}>Test Auth Flow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: isDark ? '#1DA1F2' : '#007AFF' }]}
                onPress={testFeedCreation}
              >
                <Text style={styles.testButtonText}>Test Feed Creation</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logs */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#F8F9FA' }]}>
            <View style={styles.logsHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#E0E0E0' : '#606060' }]}>
                Debug Logs
              </Text>
              <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
                <Text style={[styles.clearButtonText, { color: isDark ? '#1DA1F2' : '#007AFF' }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            {logs.map((log) => (
              <View key={log.id} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <Ionicons
                    name={getLevelIcon(log.level)}
                    size={16}
                    color={getLevelColor(log.level)}
                  />
                  <Text style={[styles.logTimestamp, { color: isDark ? '#A9A9A9' : '#A0A0A0' }]}>
                    {log.timestamp}
                  </Text>
                  <Text style={[styles.logLevel, { color: getLevelColor(log.level) }]}>
                    {log.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.logMessage, { color: isDark ? '#E0E0E0' : '#000000' }]}>
                  {log.message}
                </Text>
                {log.data && (
                  <Text style={[styles.logData, { color: isDark ? '#A9A9A9' : '#A0A0A0' }]}>
                    {JSON.stringify(log.data, null, 2)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  userInfo: {
    gap: 8,
  },
  userInfoText: {
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logEntry: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 12,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  logMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  logData: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
