import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

// Create themes compatible with react-native-paper v5
const DefaultTheme = MD3LightTheme;
const DarkTheme = MD3DarkTheme;

export interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    error?: string;
  };
  dark: boolean;
}

const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    accent: '#FF9800',
    error: '#F44336',
  },
  dark: false,
};

const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#66BB6A',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    accent: '#FFB74D',
    error: '#CF6679',
  },
  dark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          // User has a saved preference
          setIsDark(savedTheme === 'dark');
        } else {
          // No saved preference, use system theme
          const systemColorScheme = Appearance.getColorScheme();
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to system theme
        const systemColorScheme = Appearance.getColorScheme();
        setIsDark(systemColorScheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();

    // Listen to system theme changes (only if no saved preference)
    const subscription = Appearance.addChangeListener(async ({ colorScheme }) => {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (savedTheme === null) {
          // Only update if user hasn't set a preference
          setIsDark(colorScheme === 'dark');
        }
      } catch (error) {
        // If error reading, just use system theme
        setIsDark(colorScheme === 'dark');
      }
    });

    return () => subscription?.remove();
  }, []);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Save preference locally
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

