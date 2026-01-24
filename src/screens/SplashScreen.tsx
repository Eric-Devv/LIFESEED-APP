import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import * as SplashScreenLib from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const LifeseedSplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Keep splash screen visible
    SplashScreenLib.preventAutoHideAsync();

    // Animate logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide splash after animation
    const timer = setTimeout(() => {
      SplashScreenLib.hideAsync();
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const rotation = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { rotate: rotation }],
          },
        ]}
      >
        {/* Seed/Plant Logo */}
        <View style={[styles.logo, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.seed, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.leaf1, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.leaf2, { backgroundColor: theme.colors.primary }]} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={[styles.appName, { color: theme.colors.background }]}>Lifeseed</Text>
        <Text style={[styles.tagline, { color: theme.colors.background }]}>
          Grow. Reflect. Thrive.
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  seed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    bottom: 20,
  },
  leaf1: {
    width: 30,
    height: 50,
    borderRadius: 15,
    position: 'absolute',
    left: 25,
    top: 15,
    transform: [{ rotate: '-30deg' }],
  },
  leaf2: {
    width: 30,
    height: 50,
    borderRadius: 15,
    position: 'absolute',
    right: 25,
    top: 15,
    transform: [{ rotate: '30deg' }],
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 1,
    opacity: 0.9,
  },
});

export default LifeseedSplashScreen;
