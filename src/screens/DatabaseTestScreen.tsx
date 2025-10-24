import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  Title, 
  Paragraph,
  List,
  Divider
} from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../hooks/useDatabase';
import { runAllTests } from '../database/test';

interface DatabaseTestScreenProps {
  navigation: any;
}

const DatabaseTestScreen: React.FC<DatabaseTestScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    isInitialized,
    isLoading,
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    createMood,
    getMoods,
    updateMood,
    deleteMood,
    createHabit,
    getHabits,
    updateHabit,
    deleteHabit,
    createJournalEntry,
    getJournalEntries,
    updateJournalEntry,
    deleteJournalEntry,
  } = useDatabase();

  const [goals, setGoals] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Form states
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [moodEmotion, setMoodEmotion] = useState('');
  const [moodIntensity, setMoodIntensity] = useState('5');
  const [habitName, setHabitName] = useState('');
  const [journalEntry, setJournalEntry] = useState('');

  useEffect(() => {
    if (isInitialized) {
      loadAllData();
    }
  }, [isInitialized]);

  const loadAllData = async () => {
    try {
      const [goalsData, moodsData, habitsData, journalData] = await Promise.all([
        getGoals(),
        getMoods(),
        getHabits(),
        getJournalEntries(),
      ]);
      
      setGoals(goalsData);
      setMoods(moodsData);
      setHabits(habitsData);
      setJournalEntries(journalData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const newGoal = await createGoal({
        title: goalTitle,
        description: goalDescription,
        progress: 0,
        completed: false,
        timestamp: new Date().toISOString(),
      });

      if (newGoal) {
        setGoalTitle('');
        setGoalDescription('');
        loadAllData();
        Alert.alert('Success', 'Goal created successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const handleCreateMood = async () => {
    if (!moodEmotion.trim()) {
      Alert.alert('Error', 'Please enter an emotion');
      return;
    }

    try {
      const newMood = await createMood({
        emotion: moodEmotion,
        intensity: parseInt(moodIntensity),
        note: '',
        date: new Date().toISOString(),
      });

      if (newMood) {
        setMoodEmotion('');
        setMoodIntensity('5');
        loadAllData();
        Alert.alert('Success', 'Mood recorded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record mood');
    }
  };

  const handleCreateHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      const newHabit = await createHabit({
        name: habitName,
        streak: 0,
        lastUpdated: new Date().toISOString(),
      });

      if (newHabit) {
        setHabitName('');
        loadAllData();
        Alert.alert('Success', 'Habit created successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit');
    }
  };

  const handleCreateJournalEntry = async () => {
    if (!journalEntry.trim()) {
      Alert.alert('Error', 'Please enter a journal entry');
      return;
    }

    try {
      const newEntry = await createJournalEntry({
        entry: journalEntry,
        mood: 'Neutral',
        date: new Date().toISOString(),
      });

      if (newEntry) {
        setJournalEntry('');
        loadAllData();
        Alert.alert('Success', 'Journal entry created successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create journal entry');
    }
  };

  const handleRunTests = async () => {
    try {
      const results = await runAllTests();
      setTestResults([results ? 'All tests passed!' : 'Some tests failed']);
    } catch (error) {
      setTestResults(['Test execution failed']);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Initializing database...
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Database not initialized
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Title style={[styles.title, { color: theme.colors.text }]}>
        Database Test Screen
      </Title>

      {/* Test Results */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Test Results</Title>
          <Button 
            mode="contained" 
            onPress={handleRunTests}
            style={styles.testButton}
          >
            Run All Tests
          </Button>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.testResult}>{result}</Text>
          ))}
        </Card.Content>
      </Card>

      {/* Goals Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Goals ({goals.length})</Title>
          <TextInput
            label="Goal Title"
            value={goalTitle}
            onChangeText={setGoalTitle}
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={goalDescription}
            onChangeText={setGoalDescription}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleCreateGoal} style={styles.button}>
            Create Goal
          </Button>
          {goals.map((goal) => (
            <List.Item
              key={goal.id}
              title={goal.title}
              description={`Progress: ${goal.progress}%`}
              right={() => (
                <Button 
                  mode="text" 
                  onPress={() => deleteGoal(goal.id).then(() => loadAllData())}
                >
                  Delete
                </Button>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Moods Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Moods ({moods.length})</Title>
          <TextInput
            label="Emotion"
            value={moodEmotion}
            onChangeText={setMoodEmotion}
            style={styles.input}
          />
          <TextInput
            label="Intensity (1-10)"
            value={moodIntensity}
            onChangeText={setMoodIntensity}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleCreateMood} style={styles.button}>
            Record Mood
          </Button>
          {moods.map((mood) => (
            <List.Item
              key={mood.id}
              title={mood.emotion}
              description={`Intensity: ${mood.intensity}/10`}
              right={() => (
                <Button 
                  mode="text" 
                  onPress={() => deleteMood(mood.id).then(() => loadAllData())}
                >
                  Delete
                </Button>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Habits Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Habits ({habits.length})</Title>
          <TextInput
            label="Habit Name"
            value={habitName}
            onChangeText={setHabitName}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleCreateHabit} style={styles.button}>
            Create Habit
          </Button>
          {habits.map((habit) => (
            <List.Item
              key={habit.id}
              title={habit.name}
              description={`Streak: ${habit.streak} days`}
              right={() => (
                <Button 
                  mode="text" 
                  onPress={() => deleteHabit(habit.id).then(() => loadAllData())}
                >
                  Delete
                </Button>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Journal Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Journal Entries ({journalEntries.length})</Title>
          <TextInput
            label="Journal Entry"
            value={journalEntry}
            onChangeText={setJournalEntry}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleCreateJournalEntry} style={styles.button}>
            Add Entry
          </Button>
          {journalEntries.map((entry) => (
            <List.Item
              key={entry.id}
              title={entry.entry.substring(0, 50) + '...'}
              description={`Mood: ${entry.mood}`}
              right={() => (
                <Button 
                  mode="text" 
                  onPress={() => deleteJournalEntry(entry.id).then(() => loadAllData())}
                >
                  Delete
                </Button>
              )}
            />
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  testButton: {
    marginBottom: 16,
  },
  testResult: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DatabaseTestScreen;
