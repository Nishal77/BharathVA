/**
 * Centralized Font Configuration for BharathVA
 * 
 * This file contains all font definitions used across the app.
 * Import fonts here and use them via Tailwind classes.
 */

export const FontConfig = {
  // Chirp Font Family
  'Chirp-Regular': require('../assets/fonts/Chirp-Regular.ttf'),
  'Chirp-Medium': require('../assets/fonts/Chirp-Medium.ttf'),
  'Chirp-Bold': require('../assets/fonts/Chirp-Bold.ttf'),
  'Chirp Heavy': require('../assets/fonts/Chirp Heavy.ttf'),
  
  // Space Mono
  'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  
  // Additional fonts (if needed in future)
  'Aclonica-Regular': require('../assets/fonts/Aclonica-Regular.ttf'),
  'Rockybilly': require('../assets/fonts/Rockybilly.ttf'),
} as const;

/**
 * Font names mapping for Tailwind classes
 * Use these in Tailwind: font-chirp-regular, font-chirp-medium, etc.
 */
export const FontNames = {
  'chirp-regular': 'Chirp-Regular',
  'chirp-medium': 'Chirp-Medium',
  'chirp-bold': 'Chirp-Bold',
  'chirp-heavy': 'Chirp Heavy',
  'space-mono': 'SpaceMono',
  'aclonica': 'Aclonica-Regular',
  'rockybilly': 'Rockybilly',
} as const;

/**
 * Type for font family names
 */
export type FontFamilyName = keyof typeof FontNames;

/**
 * Get all fonts for useFonts hook
 * Use this in your root layout or app entry point
 */
export const getAllFonts = () => FontConfig;


