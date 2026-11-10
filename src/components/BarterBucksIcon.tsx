import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface BarterBucksIconProps {
  size?: number;
  style?: ImageStyle;
}

export default function BarterBucksIcon({ size = 24, style }: BarterBucksIconProps) {
  return (
    <Image
      source={require('../../assets/teal2.jpg')}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
}
