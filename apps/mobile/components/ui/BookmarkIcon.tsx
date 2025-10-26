import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BookmarkIconProps {
  size?: number;
  color?: string;
}

export default function BookmarkIcon({ size = 18, color = '#000000' }: BookmarkIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
    >
      <Path
        d="M14.25,16.25l-5.25-3.5-5.25,3.5V3.75c0-1.105,.895-2,2-2h6.5c1.105,0,2,.895,2,2v12.5Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </Svg>
  );
}
