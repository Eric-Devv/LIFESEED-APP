import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { ThemeProvider } from './src/context/ThemeContext';
import { UserProvider, useUser } from './src/context/UserContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import JournalScreen from './src/screens/JournalScreen';
import MoodTrackerScreen from './src/screens/MoodTrackerScreen';
import GoalTrackerScreen from './src/screens/GoalTrackerScreen';
import HabitScreen from './src/screens/HabitScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import AIMentorChat from './src/screens/AIMentorChat';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingFlow, { hasCompletedOnboarding } from './src/screens/OnboardingFlow';
import LoadingSpinner from './src/components/LoadingSpinner';
import OfflineIndicator from './src/components/OfflineIndicator';

const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      ...TransitionPresets.SlideFromRightIOS,
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        };
      },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
      },
      ...TransitionPresets.SlideFromRightIOS,
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
            opacity: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.5, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Lifeseed' }}
    />
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
    <Stack.Screen 
      name="Journal" 
      component={JournalScreen}
      options={{ title: 'Journal' }}
    />
    <Stack.Screen 
      name="MoodTracker" 
      component={MoodTrackerScreen}
      options={{ title: 'Mood Tracker' }}
    />
    <Stack.Screen 
      name="GoalTracker" 
      component={GoalTrackerScreen}
      options={{ title: 'Goal Tracker' }}
    />
    <Stack.Screen 
      name="Habits" 
      component={HabitScreen}
      options={{ title: 'Habits' }}
    />
    <Stack.Screen 
      name="Insights" 
      component={InsightsScreen}
      options={{ title: 'AI Insights' }}
    />
    <Stack.Screen 
      name="AIMentor" 
      component={AIMentorChat}
      options={{ title: 'AI Mentor' }}
    />
  </Stack.Navigator>
);

const AppContent = () => {
  const { user, loading } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!loading) {
        const completed = await hasCompletedOnboarding();
        setShowOnboarding(!completed);
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [loading]);

  if (loading || isCheckingOnboarding) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding && !user) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <PaperProvider>
          <View style={styles.container}>
            <AppContent />
            <OfflineIndicator />
            <StatusBar style="auto" />
          </View>
        </PaperProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
