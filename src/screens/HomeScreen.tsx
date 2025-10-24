import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, FAB } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to Lifeseed
        </Text>
        
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Today's Reflection
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Take a moment to reflect on your day and track your growth.
            </Text>
            <Button 
              mode="contained" 
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => {}}
            >
              Start Journaling
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Your Goals
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Track your progress and set new milestones.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => {}}
            >
              View Goals
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              AI Insights
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Get personalized insights from your journal entries.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => {}}
            >
              View Insights
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  button: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;

