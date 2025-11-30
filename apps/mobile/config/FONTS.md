# Font Configuration Guide

## Overview

All fonts are centrally configured in `config/fonts.ts` and loaded globally in `app/_layout.tsx`. This ensures fonts are available throughout the app without needing to load them in individual components.

## Available Fonts

### Chirp Font Family
- `font-chirp-regular` - Chirp Regular
- `font-chirp-medium` - Chirp Medium  
- `font-chirp-bold` - Chirp Bold
- `font-chirp-heavy` - Chirp Heavy (Boldest)

### Other Fonts
- `font-space-mono` - Space Mono
- `font-aclonica` - Aclonica Regular
- `font-rockybilly` - Rockybilly

## Usage

### Using Tailwind Classes (Recommended)

Simply add the font class to your component:

```tsx
<Text className="font-chirp-heavy text-black dark:text-white">
  Heading Text
</Text>

<Text className="font-chirp-medium text-gray-600">
  Body Text
</Text>

<Text className="font-chirp-regular text-sm">
  Small Text
</Text>
```

### Using Inline Styles (If Needed)

If you need dynamic font sizes or other custom styling:

```tsx
<Text 
  className="font-chirp-heavy dark:text-white text-black"
  style={{ 
    fontSize: 24,
    letterSpacing: -0.5,
  }}
>
  Custom Styled Text
</Text>
```

## Examples

### Heading with Chirp Heavy
```tsx
<Text className="font-chirp-heavy text-2xl dark:text-white text-black">
  What's Happening in Mumbai
</Text>
```

### Body Text with Chirp Medium
```tsx
<Text className="font-chirp-medium text-base text-gray-700 dark:text-gray-300">
  This is body text using Chirp Medium
</Text>
```

### Regular Text
```tsx
<Text className="font-chirp-regular text-sm text-gray-600 dark:text-gray-400">
  Regular weight text
</Text>
```

## Adding New Fonts

1. Add the font file to `apps/mobile/assets/fonts/`
2. Add the font to `config/fonts.ts`:
   ```typescript
   'FontName': require('../assets/fonts/FontName.ttf'),
   ```
3. Add to Tailwind config in `tailwind.config.js`:
   ```javascript
   'font-name': ['FontName', 'sans-serif'],
   ```
4. Use in components: `className="font-name"`

## Notes

- All fonts are loaded globally in `app/_layout.tsx`
- No need to use `useFonts` hook in individual components
- Fonts are available immediately after app loads
- Use Tailwind classes for consistency across the app

