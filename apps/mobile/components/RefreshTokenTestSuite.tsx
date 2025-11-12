/**
 * Refresh Token Flow Test Suite Component
 * Provides UI to test the refresh token flow
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { runRefreshTokenFlowTests, TestResult } from '../utils/refreshTokenFlowTests';
import { tokenManager } from '../services/api/authService';

export const RefreshTokenTestSuite: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const testResults = await runRefreshTokenFlowTests();
      setResults(testResults);
      
      const token = await tokenManager.getAccessToken();
      setCurrentToken(token);
    } catch (error) {
      console.error('Test suite error:', error);
      setResults([{
        testName: 'Test Suite',
        success: false,
        message: `Test suite failed: ${error instanceof Error ? error.message : String(error)}`,
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 Refresh Token Flow Tests</Text>
        <Text style={styles.subtitle}>Test database integration and token refresh</Text>
      </View>

      {currentToken && (
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenLabel}>Current Access Token:</Text>
          <Text style={styles.tokenValue} numberOfLines={1}>
            {currentToken.substring(0, 50)}...
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={runTests}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Run Tests</Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={styles.results}>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              ✅ Passed: {passedCount} | ❌ Failed: {failedCount}
            </Text>
          </View>

          {results.map((result, index) => (
            <View
              key={index}
              style={[
                styles.resultItem,
                result.success ? styles.resultSuccess : styles.resultFailed,
              ]}
            >
              <Text style={styles.resultIcon}>
                {result.success ? '✅' : '❌'}
              </Text>
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{result.testName}</Text>
                <Text style={styles.resultMessage}>{result.message}</Text>
                {result.details && (
                  <Text style={styles.resultDetails}>
                    {JSON.stringify(result.details, null, 2)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>📋 Test Instructions</Text>
        <Text style={styles.instructionText}>
          1. Ensure you are logged in{'\n'}
          2. Make sure backend auth-service is running{'\n'}
          3. Restart backend after adding new endpoint{'\n'}
          4. Click "Run Tests" to verify the flow
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  tokenInfo: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    padding: 16,
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultFailed: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default RefreshTokenTestSuite;


