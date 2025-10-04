import React from 'react';
import { Text, View } from 'react-native';
import { useTabStyles } from '../../hooks/useTabStyles';

interface TweetContentProps {
  text: string;
  emojis?: string[];
}

export default function TweetContent({ text, emojis }: TweetContentProps) {
  const tabStyles = useTabStyles();

  return (
    <View style={{ marginBottom: 16, marginLeft: 60, marginTop: -20, marginRight: 12 }}>
      <Text style={{ 
        fontSize: 14, 
        color: tabStyles.text.primary, 
        lineHeight: 20,
        flexWrap: 'wrap'
      }}>
        {text}
        {emojis && (
          <Text style={{ fontSize: 16, marginLeft: 6 }}>
            {emojis.join(' ')}
          </Text>
        )}
      </Text>
    </View>
  );
}
