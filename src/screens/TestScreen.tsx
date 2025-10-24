import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const TestScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Lifeseed Test Screen
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Theme: {theme.dark ? 'Dark' : 'Light'}
      </Text>
      <Button 
        mode="contained" 
        onPress={toggleTheme}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        Toggle Theme
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});

export default TestScreen;

