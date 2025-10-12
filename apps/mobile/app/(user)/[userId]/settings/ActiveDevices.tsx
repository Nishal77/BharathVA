import { useRouter } from 'expo-router';
import { Monitor, RefreshCw, Shield, Smartphone, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme
} from 'react-native';
import { authService, UserSessionInfo } from '../../../../services/api/authService';

export default function ActiveDevicesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [sessions, setSessions] = useState<UserSessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const cardBg = isDark ? '#151515' : '#F9FAFB';

  const loadSessions = useCallback(async () => {
    try {
      const activeSessions = await authService.getActiveSessions();
      setSessions(activeSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load active devices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const handleLogoutDevice = async (sessionId: string, deviceInfo: string) => {
    Alert.alert(
      'Logout Device',
      `Are you sure you want to logout from:\n${deviceInfo}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await authService.logoutSession(sessionId);
              await loadSessions();
              Alert.alert('Success', 'Device logged out successfully');
            } catch (error) {
              console.error('Error logging out device:', error);
              Alert.alert('Error', 'Failed to logout device');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogoutAllOther = async () => {
    if (sessions.length <= 1) {
      Alert.alert('Info', 'No other devices to logout');
      return;
    }

    Alert.alert(
      'Logout All Other Devices',
      `This will logout ${sessions.length - 1} other device(s). You will remain logged in on this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await authService.logoutAllOtherSessions();
              await loadSessions();
              Alert.alert('Success', 'All other devices logged out successfully');
            } catch (error) {
              console.error('Error logging out other devices:', error);
              Alert.alert('Error', 'Failed to logout other devices');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatLastActive = (lastUsedAt: string): string => {
    const now = new Date();
    const lastUsed = new Date(lastUsedAt);
    const diffMs = now.getTime() - lastUsed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile')) {
      return <Smartphone size={24} color={textColor} />;
    }
    return <Monitor size={24} color={textColor} />;
  };

  if (loading && sessions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: bgColor }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-base" style={{ color: secondaryTextColor }}>
          Loading devices...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View className="pt-16 pb-4 px-6" style={{ backgroundColor: bgColor }}>
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className="text-2xl" style={{ color: textColor }}>←</Text>
          </Pressable>
          
          <Text className="text-xl font-bold flex-1 text-center" style={{ color: textColor }}>
            Active Devices
          </Text>
          
          <Pressable
            onPress={handleRefresh}
            className="w-10 h-10 items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <RefreshCw size={20} color={textColor} />
          </Pressable>
        </View>
        
        <View className="flex-row items-center" style={{ marginBottom: 12 }}>
          <Shield size={16} color="#10B981" style={{ marginRight: 8 }} />
          <Text className="text-sm" style={{ color: secondaryTextColor }}>
            {sessions.length} active device{sessions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-6">
          {sessions.map((session, index) => (
            <View
              key={session.id}
              className="rounded-2xl p-4 mb-4"
              style={{
                backgroundColor: cardBg,
                borderWidth: session.isCurrentSession ? 2 : 1,
                borderColor: session.isCurrentSession ? '#3B82F6' : borderColor,
              }}
            >
              {/* Current Device Badge */}
              {session.isCurrentSession && (
                <View className="absolute top-3 right-3 bg-blue-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    This Device
                  </Text>
                </View>
              )}

              {/* Device Info Row */}
              <View className="flex-row items-start mb-3">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" 
                      style={{ backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }}>
                  {getDeviceIcon(session.deviceInfo)}
                </View>
                
                <View className="flex-1">
                  <Text className="text-base font-bold mb-1" style={{ color: textColor }}>
                    {session.deviceInfo || 'Unknown Device'}
                  </Text>
                  <Text className="text-sm" style={{ color: secondaryTextColor }}>
                    {session.ipAddress || 'Unknown IP'}
                  </Text>
                </View>
              </View>

              {/* Last Active */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm" style={{ color: secondaryTextColor }}>
                  Last active: {formatLastActive(session.lastUsedAt)}
                </Text>
              </View>

              {/* Logout Button */}
              {!session.isCurrentSession && (
                <Pressable
                  onPress={() => handleLogoutDevice(session.id, session.deviceInfo)}
                  className="py-3 px-4 rounded-xl"
                  style={({ pressed }) => ({
                    backgroundColor: '#EF4444',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View className="flex-row items-center justify-center">
                    <Trash2 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text className="text-white font-semibold text-sm">
                      Logout Device
                    </Text>
                  </View>
                </Pressable>
              )}

              {session.isCurrentSession && (
                <View className="py-3 px-4 rounded-xl" style={{ backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }}>
                  <Text className="text-center text-sm font-medium" style={{ color: secondaryTextColor }}>
                    Current active device
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Logout All Other Devices Button */}
          {sessions.length > 1 && (
            <Pressable
              onPress={handleLogoutAllOther}
              className="py-4 px-6 rounded-xl mb-6"
              style={({ pressed }) => ({
                backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                borderWidth: 1,
                borderColor: borderColor,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View className="flex-row items-center justify-center">
                <Trash2 size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="font-bold text-base" style={{ color: '#EF4444' }}>
                  Logout All Other Devices
                </Text>
              </View>
            </Pressable>
          )}

          {/* Info Card */}
          <View 
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: isDark ? '#1F2937' : '#EFF6FF' }}
          >
            <View className="flex-row items-start">
              <Shield size={20} color="#3B82F6" style={{ marginRight: 12, marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
                  Security Notice
                </Text>
                <Text className="text-xs leading-5" style={{ color: secondaryTextColor }}>
                  If you see a device you don't recognize, logout immediately and change your password.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

