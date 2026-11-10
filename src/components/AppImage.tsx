import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type Props = {
  uri: string;
  width: number;
  height: number;
  borderRadius?: number;
  fallbackText?: string;
  style?: ViewStyle;
};

export default function AppImage({
  uri,
  width,
  height,
  borderRadius = 0,
  fallbackText = '',
  style,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  function handleLoad() {
    setLoading(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  function handleError() {
    setLoading(false);
    setErrored(true);
  }

  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: '#00BCD4',
  };

  if (errored) {
    return (
      <View style={[containerStyle, styles.fallback, style]}>
        <Text style={styles.fallbackText}>
          {(fallbackText || '?')[0].toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#FFF" />
        </View>
      )}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <Image
          source={{ uri }}
          style={{ width, height }}
          resizeMode="cover"
          onLoad={handleLoad}
          onError={handleError}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00BCD4',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
});
