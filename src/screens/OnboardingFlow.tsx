import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';
import * as SecureStore from 'expo-secure-store';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const ONBOARDING_KEY = 'has_completed_onboarding';

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState(1);

  const handleNext = () => {
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    } else {
        handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {currentScreen === 1 && (
        <OnboardingScreen1 navigation={null} onNext={handleNext} />
      )}
      {currentScreen === 2 && (
        <OnboardingScreen2
          navigation={null}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
      {currentScreen === 3 && (
        <OnboardingScreen3
          navigation={null}
          onFinish={handleComplete}
          onPrevious={handlePrevious}
        />
      )}
    </View>
  );
};

export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingFlow;
