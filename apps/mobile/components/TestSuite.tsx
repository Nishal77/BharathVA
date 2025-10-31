import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { runUnitTests, runNetworkTests } from '../utils/unitTests';
import { networkTester } from '../utils/networkTest';

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  details?: any;
}

export default function TestSuite() {
  const [isRunning, setIsRunning] = useState(false);
  const [unitTestResults, setUnitTestResults] = useState<TestResult[]>([]);
  const [networkTestResults, setNetworkTestResults] = useState<TestResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    
    try {
      console.log('🧪 Starting Test Suite...');
      
      // Run unit tests
      console.log('Running Unit Tests...');
      const unitResults = await runUnitTests();
      setUnitTestResults(unitResults);
      
      // Run network tests
      console.log('Running Network Tests...');
      const networkResults = await runNetworkTests();
      setNetworkTestResults(networkResults);
      
      // Show summary
      const unitSummary = getSummary(unitResults);
      const networkSummary = getSummary(networkResults);
      
      Alert.alert(
        'Test Suite Complete',
        `Unit Tests: ${unitSummary.passed}/${unitSummary.total} passed\nNetwork Tests: ${networkSummary.passed}/${networkSummary.total} passed`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Test suite error:', error);
      Alert.alert('Test Error', 'An error occurred while running tests');
    } finally {
      setIsRunning(false);
    }
  };

  const getSummary = (results: TestResult[]) => {
    const total = results.length;
    const passed = results.filter(r => r.success).length;
    const failed = total - passed;
    return { total, passed, failed };
  };

  const renderTestResult = (result: TestResult, index: number) => (
    <View key={index} className="mb-3 p-3 bg-gray-100 rounded-lg">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-base">
          {result.success ? '✅' : '❌'} {result.testName}
        </Text>
        <Text className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success ? 'PASSED' : 'FAILED'}
        </Text>
      </View>
      
      {result.error && (
        <Text className="text-red-600 text-sm mt-1">
          Error: {result.error}
        </Text>
      )}
      
      {showDetails && result.details && (
        <View className="mt-2 p-2 bg-gray-200 rounded">
          <Text className="text-xs text-gray-600">
            Details: {JSON.stringify(result.details, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );

  const unitSummary = getSummary(unitTestResults);
  const networkSummary = getSummary(networkTestResults);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-center mb-6">
          BharathVA Test Suite
        </Text>
        
        <TouchableOpacity
          onPress={runAllTests}
          disabled={isRunning}
          className={`p-4 rounded-lg mb-6 ${
            isRunning ? 'bg-gray-400' : 'bg-blue-500'
          }`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          className="p-2 bg-gray-200 rounded-lg mb-4"
        >
          <Text className="text-center">
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Text>
        </TouchableOpacity>

        {/* Unit Tests Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3">
            Unit Tests ({unitSummary.passed}/{unitSummary.total})
          </Text>
          
          {unitTestResults.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No unit tests run yet
            </Text>
          ) : (
            unitTestResults.map((result, index) => renderTestResult(result, index))
          )}
        </View>

        {/* Network Tests Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3">
            Network Tests ({networkSummary.passed}/{networkSummary.total})
          </Text>
          
          {networkTestResults.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No network tests run yet
            </Text>
          ) : (
            networkTestResults.map((result, index) => renderTestResult(result, index))
          )}
        </View>

        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-lg font-bold mb-3">Quick Actions</Text>
          
          <TouchableOpacity
            onPress={() => {
              console.log('🧪 Running Unit Tests Only...');
              runUnitTests().then(setUnitTestResults);
            }}
            className="p-3 bg-green-500 rounded-lg mb-2"
          >
            <Text className="text-white text-center">Run Unit Tests Only</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              console.log('🌐 Running Network Tests Only...');
              runNetworkTests().then(setNetworkTestResults);
            }}
            className="p-3 bg-blue-500 rounded-lg mb-2"
          >
            <Text className="text-white text-center">Run Network Tests Only</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setUnitTestResults([]);
              setNetworkTestResults([]);
            }}
            className="p-3 bg-gray-500 rounded-lg"
          >
            <Text className="text-white text-center">Clear Results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
