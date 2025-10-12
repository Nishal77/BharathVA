import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface DeviceInfo {
  deviceInfo: string;
  ipAddress: string;
}

class DeviceInfoService {
  private cachedIp: string | null = null;

  async getPublicIpAddress(): Promise<string> {
    if (this.cachedIp) {
      return this.cachedIp;
    }

    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch IP address');
      }

      const data = await response.json();
      this.cachedIp = data.ip;
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return 'Unknown';
    }
  }

  async getDeviceInfo(): Promise<string> {
    try {
      const osName = Device.osName || Platform.OS;
      const osVersion = Device.osVersion || 'Unknown';
      const modelName = Device.modelName || Device.deviceName || 'Unknown Device';
      const brand = Device.brand || '';

      let deviceString = '';

      if (Platform.OS === 'android') {
        deviceString = `Android ${osVersion} | ${brand} ${modelName}`;
      } else if (Platform.OS === 'ios') {
        deviceString = `iOS ${osVersion} | ${modelName}`;
      } else if (Platform.OS === 'web') {
        const userAgent = navigator.userAgent;
        let browser = 'Browser';
        
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        let os = 'Unknown OS';
        if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Linux')) os = 'Linux';
        
        deviceString = `${os} | ${browser}`;
      } else {
        deviceString = `${osName} ${osVersion} | ${modelName}`;
      }

      return deviceString;
    } catch (error) {
      console.error('Error getting device info:', error);
      return `${Platform.OS} | Unknown Device`;
    }
  }

  async getFullDeviceInfo(): Promise<DeviceInfo> {
    console.log('COLLECTING DEVICE INFORMATION');
    
    const [deviceInfo, ipAddress] = await Promise.all([
      this.getDeviceInfo(),
      this.getPublicIpAddress(),
    ]);

    console.log('Device Info Collected:');
    console.log('Device:', deviceInfo);
    console.log('IP Address:', ipAddress);

    return {
      deviceInfo,
      ipAddress,
    };
  }

  clearCache(): void {
    this.cachedIp = null;
  }
}

export const deviceInfoService = new DeviceInfoService();

