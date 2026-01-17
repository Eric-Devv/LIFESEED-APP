import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { scale, moderateScale } from '../utils/responsive';

interface OnboardingScreen1Props {
  navigation: any;
  onNext: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ navigation, onNext }) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Icon/Illustration */}
        <Surface style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.icon, { color: theme.colors.primary }]}>🌱</Text>
        </Surface>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to Lifeseed
        </Text>
        <Text style={[styles.description, { color: theme.colors.text }]}>
          Your personal growth companion. Track your journey, reflect on your experiences, and
          discover insights about yourself.
        </Text>
        <Text style={[styles.subDescription, { color: theme.colors.text }]}>
          Start your journey of self-discovery and personal development today.
        </Text>

        <Button
          mode="contained"
          onPress={onNext}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Get Started
        </Button>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: scale(60),
    paddingBottom: scale(40),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(40),
    elevation: 8,
  },
  icon: {
    fontSize: scale(60),
  },
  title: {
    fontSize: moderateScale(32, 0.3),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(16),
    letterSpacing: 0.5,
  },
  description: {
    fontSize: moderateScale(18, 0.3),
    textAlign: 'center',
    lineHeight: moderateScale(26, 0.3),
    marginBottom: scale(16),
    opacity: 0.9,
    paddingHorizontal: scale(20),
  },
  subDescription: {
    fontSize: moderateScale(16, 0.3),
    textAlign: 'center',
    lineHeight: moderateScale(24, 0.3),
    marginBottom: scale(40),
    opacity: 0.7,
    paddingHorizontal: scale(20),
  },
  button: {
    borderRadius: scale(28),
    paddingHorizontal: scale(40),
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: scale(8),
  },
  buttonLabel: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen1;
