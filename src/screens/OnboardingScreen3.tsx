import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { scale, moderateScale } from '../utils/responsive';

interface OnboardingScreen3Props {
  navigation: any;
  onFinish: () => void;
  onPrevious: () => void;
}

const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({ navigation, onFinish, onPrevious }) => {
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
          <Text style={[styles.icon, { color: theme.colors.primary }]}>🤖</Text>
        </Surface>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          AI-Powered Insights
        </Text>
        <Text style={[styles.description, { color: theme.colors.text }]}>
          Get personalized insights and recommendations powered by AI. Chat with your AI mentor
          for guidance on your personal growth journey.
        </Text>

        {/* Feature List */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.primary }]}>✨</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>
              Discover patterns in your data
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.primary }]}>💡</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>
              Receive personalized recommendations
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.primary }]}>💬</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>
              Chat with your AI mentor anytime
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onPrevious}
            style={[styles.button, styles.buttonSecondary]}
            contentStyle={styles.buttonContent}
          >
            Previous
          </Button>
          <Button
            mode="contained"
            onPress={onFinish}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Start Journey
          </Button>
        </View>
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
    marginBottom: scale(32),
    opacity: 0.9,
    paddingHorizontal: scale(20),
  },
  featuresContainer: {
    width: '100%',
    marginBottom: scale(40),
    paddingHorizontal: scale(20),
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  featureIcon: {
    fontSize: moderateScale(24, 0.3),
    marginRight: scale(12),
  },
  featureText: {
    fontSize: moderateScale(16, 0.3),
    flex: 1,
    lineHeight: moderateScale(24, 0.3),
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
  },
  button: {
    flex: 1,
    borderRadius: scale(28),
    marginHorizontal: scale(8),
    elevation: 4,
  },
  buttonSecondary: {
    borderWidth: 2,
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

export default OnboardingScreen3;
