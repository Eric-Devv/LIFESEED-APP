import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../context/ThemeContext';
import { scale, moderateScale } from '../utils/responsive';

const OfflineIndicator: React.FC = () => {
  const { theme } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);

      if (offline) {
        // Slide in
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Slide out
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.error || '#F44336',
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Surface style={[styles.indicator, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.text, { color: '#FFFFFF', fontSize: moderateScale(14, 0.3) }]}>
          ⚠️ Offline Mode - Data will sync when connection is restored
        </Text>
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: scale(40),
    paddingBottom: scale(12),
    paddingHorizontal: scale(16),
  },
  indicator: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
  },
  text: {
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OfflineIndicator;
