import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTabStyles } from '../../../../hooks/useTabStyles';

export default function CreateScreen() {
  const tabStyles = useTabStyles();

  return (
    <View style={[styles.container, { backgroundColor: tabStyles.container.backgroundColor }]}>
      <Text style={[styles.title, { color: tabStyles.text.active }]}>
        Create Content
      </Text>
      <Text style={[styles.subtitle, { color: tabStyles.text.inactive }]}>
        This is the create screen where users can create new content.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
