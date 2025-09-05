import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import HouseIcon from './HouseIcon';

export default function SplashScreen({ onFinish }) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <HouseIcon size={80} />
        </View>
        <Text style={styles.text}>소심하지만 집은 구하고 싶어</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    color: 'white',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
    letterSpacing: 0.5,
  },
});