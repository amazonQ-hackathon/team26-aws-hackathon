import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export default function HouseIcon({ size = 60 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 10 L20 35 L20 85 L80 85 L80 35 Z"
        fill="white"
        stroke="white"
        strokeWidth="2"
      />
      <Rect
        x="40"
        y="60"
        width="20"
        height="25"
        fill="#4A90E2"
      />
      <Rect
        x="30"
        y="45"
        width="12"
        height="12"
        fill="#4A90E2"
      />
      <Rect
        x="58"
        y="45"
        width="12"
        height="12"
        fill="#4A90E2"
      />
    </Svg>
  );
}