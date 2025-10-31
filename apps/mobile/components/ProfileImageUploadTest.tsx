import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { testProfileImageUpload, testProfileUpdateWithImage } from '../utils/testProfileImageUpload';

/**
 * Test Component for Profile Image Upload
 * Add this to your app temporarily to test the upload functionality
 * 
 * Usage: Import and add to a test screen or debug menu
 */
export default function ProfileImageUploadTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string>('');

  const logResult = (message: string) => {
    setResults((prev) => prev + message + '\n');
    console.log(message);
  };

  const clearResults = () => {
    setResults('');
  };

  const handlePickAndTest = async () => {
    try {
      setIsRunning(true);
      clearResults();
      logResult('🧪 Starting Profile Image Upload Test...\n');

      // Request permissions
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access to test image upload.');
        setIsRunning(false);
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        logResult('❌ Image selection canceled');
        setIsRunning(false);
        return;
      }

      const imageUri = result.assets[0].uri;
      logResult(`📸 Selected image: ${imageUri}\n`);

      // Run the test
      logResult('📤 Uploading image...\n');
      const testResult = await testProfileImageUpload(imageUri);

      if (testResult.success) {
        logResult('\n✅ Test completed successfully!');
        if (testResult.data) {
          logResult(`\n📊 Results:`);
          logResult(`  - Uploaded URL: ${testResult.data.uploadedUrl}`);
          logResult(`  - Saved URL: ${testResult.data.savedUrl}`);
          logResult(`  - URLs Match: ${testResult.data.matches ? '✅' : '❌'}`);
        }
      } else {
        logResult(`\n❌ Test failed: ${testResult.error}`);
        if (testResult.details) {
          logResult(`Details: ${JSON.stringify(testResult.details, null, 2)}`);
        }
      }
    } catch (error: any) {
      logResult(`\n❌ Unexpected error: ${error.message}`);
      console.error('Test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTestUpdateFlow = async () => {
    try {
      setIsRunning(true);
      clearResults();
      logResult('🧪 Testing Profile Update Flow with Image...\n');

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        setIsRunning(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        logResult('❌ Image selection canceled');
        setIsRunning(false);
        return;
      }

      const imageUri = result.assets[0].uri;
      logResult(`📸 Selected image: ${imageUri}\n`);

      const testResult = await testProfileUpdateWithImage(imageUri);

      if (testResult.success) {
        logResult('\n✅ Profile update flow completed successfully!');
      } else {
        logResult(`\n❌ Test failed: ${testResult.error}`);
      }
    } catch (error: any) {
      logResult(`\n❌ Unexpected error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Profile Image Upload Test
      </Text>

      <View style={{ gap: 12, marginBottom: 20 }}>
        <Pressable
          onPress={handlePickAndTest}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#ccc' : '#007AFF',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            {isRunning ? 'Running Test...' : 'Test Image Upload'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleTestUpdateFlow}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#ccc' : '#34C759',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            {isRunning ? 'Running...' : 'Test Full Update Flow'}
          </Text>
        </Pressable>

        <Pressable
          onPress={clearResults}
          disabled={isRunning}
          style={{
            backgroundColor: '#FF9500',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            Clear Results
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: '#f5f5f5',
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#333',
          }}
        >
          {results || 'No test results yet. Run a test to see output here.'}
        </Text>
      </ScrollView>

      <Text
        style={{
          marginTop: 10,
          fontSize: 12,
          color: '#666',
          fontStyle: 'italic',
        }}
      >
        Check console for detailed logs
      </Text>
    </View>
  );
}

