import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SuccessAnimationProps {
  onAnimationFinish?: () => void;
  size?: number;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  onAnimationFinish, 
  size = 150 
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate circle first
    Animated.sequence([
      Animated.parallel([
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onAnimationFinish?.();
      }, 500);
    });
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderColor: theme.colors.primary,
            opacity: circleOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.checkmark,
            {
              opacity: checkmarkOpacity,
            },
          ]}
        >
          <View
            style={[
              styles.checkmarkStem,
              {
                backgroundColor: theme.colors.background,
                width: size * 0.08,
                height: size * 0.4,
              },
            ]}
          />
          <View
            style={[
              styles.checkmarkKick,
              {
                backgroundColor: theme.colors.background,
                width: size * 0.08,
                height: size * 0.25,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    borderRadius: 1000,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkmark: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkStem: {
    position: 'absolute',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    top: '35%',
    left: '30%',
  },
  checkmarkKick: {
    position: 'absolute',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
    top: '45%',
    left: '45%',
  },
});

export default SuccessAnimation;
