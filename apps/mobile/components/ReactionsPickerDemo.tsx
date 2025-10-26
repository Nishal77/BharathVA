import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ReactionsPicker from './ReactionsPicker';

export default function ReactionsPickerDemo() {
  const [isReactionsPickerVisible, setIsReactionsPickerVisible] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState('');

  const handleReactionSelect = (emoji: string) => {
    setSelectedReaction(emoji);
    console.log('Selected reaction:', emoji);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reactions Picker Demo</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsReactionsPickerVisible(true)}
      >
        <Text style={styles.buttonText}>Show Reactions Picker</Text>
      </TouchableOpacity>

      {selectedReaction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Selected: {selectedReaction}</Text>
        </View>
      )}

      <ReactionsPicker
        visible={isReactionsPickerVisible}
        onClose={() => setIsReactionsPickerVisible(false)}
        onReactionSelect={handleReactionSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    color: '#333',
  },
});
