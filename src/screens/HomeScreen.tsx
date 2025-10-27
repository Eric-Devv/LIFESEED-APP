import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, FAB, Appbar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { userProfile } = useUser();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Lifeseed" />
        <Appbar.Action 
          icon="account" 
          onPress={() => navigation.navigate('Profile')}
        />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome back, {userProfile?.name || 'User'}!
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
              onPress={() => navigation.navigate('Journal')}
            >
              Start Journaling
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Mood Tracker
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Track your emotions and see patterns over time.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('MoodTracker')}
            >
              Track Mood
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
              onPress={() => navigation.navigate('GoalTracker')}
            >
              View Goals
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Habit Builder
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Build positive habits and track your streaks.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('Habits')}
            >
              Manage Habits
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

