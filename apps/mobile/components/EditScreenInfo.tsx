import React from 'react';
import { Text, View } from 'react-native';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View className="bg-white dark:bg-black">
      <View className="items-center mx-12">
        <Text className="text-lg leading-6 text-center text-gray-800 dark:text-gray-200 mb-4">
          Open up the code for this screen:
        </Text>

        <View className="rounded bg-gray-100 dark:bg-white/5 px-2 py-1 my-2">
          <MonoText className="text-gray-900 dark:text-white">{path}</MonoText>
        </View>

        <Text className="text-lg leading-6 text-center text-gray-800 dark:text-gray-200">
          Change any of the text, save the file, and your app will automatically update.
        </Text>
      </View>

      <View className="mt-4 mx-5 items-center">
        <ExternalLink
          className="py-4"
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
          <Text className="text-center text-blue-600 dark:text-blue-400">
            Tap here if your app doesn't automatically update after making changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}

