/**
 * NativeWind themed components - simplified for Tailwind CSS usage
 * Use className prop with dark: prefix for dark mode support
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

export type TextProps = DefaultText['props'];
export type ViewProps = DefaultView['props'];

export function Text(props: TextProps) {
  return <DefaultText className="text-gray-900 dark:text-white" {...props} />;
}

export function View(props: ViewProps) {
  return <DefaultView className="bg-white dark:bg-black" {...props} />;
}
