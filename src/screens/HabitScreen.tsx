import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  TextInput, 
  Button, 
  FAB,
  Portal,
  Dialog,
  Paragraph,
  IconButton,
  Chip,
  ProgressBar
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../hooks/useDatabase';

interface HabitScreenProps {
  navigation: any;
}

interface Habit {
  id?: number;
  name: string;
  streak: number;
  lastUpdated: string;
  targetDays?: number;
  completedDates?: string[];
}

const HabitScreen: React.FC<HabitScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { createHabit, getHabits, updateHabit, deleteHabit } = useDatabase();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentHabit, setCurrentHabit] = useState<Habit>({
    name: '',
    streak: 0,
    lastUpdated: new Date().toISOString(),
    targetDays: 7,
    completedDates: []
  });
  const [showHabitDialog, setShowHabitDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habitEntries = await getHabits();
      setHabits(habitEntries);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleSaveHabit = async () => {
    if (!currentHabit.name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setIsLoading(true);
    try {
      if (editingHabit) {
        // Update existing habit
        await updateHabit(editingHabit.id!, {
          name: currentHabit.name,
          streak: currentHabit.streak,
          lastUpdated: currentHabit.lastUpdated,
          targetDays: currentHabit.targetDays,
          completedDates: currentHabit.completedDates ? JSON.stringify(currentHabit.completedDates) : undefined
        } as any);
      } else {
        // Create new habit
        await createHabit({
          name: currentHabit.name,
          streak: currentHabit.streak,
          lastUpdated: currentHabit.lastUpdated,
          targetDays: currentHabit.targetDays,
          completedDates: currentHabit.completedDates ? JSON.stringify(currentHabit.completedDates) : undefined
        } as any);
      }

      await loadHabits();
      resetForm();
      setShowHabitDialog(false);
      Alert.alert('Success', 'Habit saved successfully!');
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setCurrentHabit(habit);
    setShowHabitDialog(true);
  };

  const handleDeleteHabit = (habitId: number) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              await loadHabits();
              Alert.alert('Success', 'Habit deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit');
            }
          }
        }
      ]
    );
  };

  const handleToggleHabit = async (habitId: number, date: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const completedDates = habit.completedDates || [];
      const isCompleted = completedDates.includes(date);
      
      let newCompletedDates;
      let newStreak = habit.streak;

      if (isCompleted) {
        // Remove completion
        newCompletedDates = completedDates.filter(d => d !== date);
        // Recalculate streak
        newStreak = calculateStreak(newCompletedDates);
      } else {
        // Add completion
        newCompletedDates = [...completedDates, date];
        // Update streak
        newStreak = calculateStreak(newCompletedDates);
      }

      await updateHabit(habitId, {
        completedDates: JSON.stringify(newCompletedDates),
        streak: newStreak,
        lastUpdated: new Date().toISOString()
      } as any);

      await loadHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;

    const sortedDates = completedDates
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (date.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const resetForm = () => {
    setCurrentHabit({
      name: '',
      streak: 0,
      lastUpdated: new Date().toISOString(),
      targetDays: 7,
      completedDates: []
    });
    setEditingHabit(null);
  };

  const getHabitStats = () => {
    const total = habits.length;
    const active = habits.filter(h => h.streak > 0).length;
    const longestStreak = Math.max(...habits.map(h => h.streak), 0);
    const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
    
    return { total, active, longestStreak, totalStreaks };
  };

  const getMarkedDates = () => {
    const marked: any = {};
    const today = new Date().toISOString().split('T')[0];
    
    habits.forEach(habit => {
      const completedDates = habit.completedDates || [];
      completedDates.forEach(date => {
        if (!marked[date]) {
          marked[date] = { marked: true, dots: [] };
        }
        marked[date].dots.push({
          key: habit.id,
          color: theme.colors.primary,
          selectedDotColor: theme.colors.primary
        });
      });
    });

    marked[today] = {
      ...marked[today],
      selected: true,
      selectedColor: theme.colors.primary
    };

    return marked;
  };

  const getHabitsForDate = (date: string) => {
    return habits.map(habit => {
      const completedDates = habit.completedDates || [];
      const isCompleted = completedDates.includes(date);
      return { ...habit, isCompleted };
    });
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#4CAF50';
    if (streak >= 14) return '#8BC34A';
    if (streak >= 7) return '#FFC107';
    if (streak >= 3) return '#FF9800';
    return '#F44336';
  };

  const stats = getHabitStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={[styles.title, { color: theme.colors.text }]}>
          Habit Builder
        </Title>

        {/* Stats Overview */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>Habit Statistics</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {stats.total}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                  Total Habits
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                  {stats.active}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                  Active
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FF9800' }]}>
                  {stats.longestStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                  Longest Streak
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#2196F3' }]}>
                  {stats.totalStreaks}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                  Total Days
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Calendar */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>Habit Calendar</Title>
            <Calendar
              current={selectedDate}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: theme.colors.surface,
                calendarBackground: theme.colors.surface,
                textSectionTitleColor: theme.colors.text,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.text + '50',
                dotColor: theme.colors.primary,
                selectedDotColor: '#ffffff',
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                indicatorColor: theme.colors.primary,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13
              }}
            />
          </Card.Content>
        </Card>

        {/* Selected Date Habits */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>{new Date(selectedDate).toLocaleDateString()}</Title>
            {getHabitsForDate(selectedDate).map((habit) => (
              <View key={habit.id} style={styles.habitItem}>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: theme.colors.text }]}>
                    {habit.name}
                  </Text>
                  <Text style={[styles.habitStreak, { color: getStreakColor(habit.streak) }]}>
                    🔥 {habit.streak} day streak
                  </Text>
                </View>
                <Button
                  mode={habit.isCompleted ? 'contained' : 'outlined'}
                  onPress={() => handleToggleHabit(habit.id!, selectedDate)}
                  style={[
                    styles.habitButton,
                    habit.isCompleted && { backgroundColor: '#4CAF50' }
                  ]}
                  textColor={habit.isCompleted ? '#ffffff' : theme.colors.primary}
                >
                  {habit.isCompleted ? '✓' : '○'}
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Habits List */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>All Habits</Title>
            {habits.length === 0 ? (
              <Paragraph style={[styles.emptyText, { color: theme.colors.text }]}>
                No habits created yet. Tap the + button to create your first habit!
              </Paragraph>
            ) : (
              habits.map((habit) => (
                <Card key={habit.id} style={[styles.habitCard, { backgroundColor: theme.colors.background }]}>
                  <Card.Content>
                    <View style={styles.habitHeader}>
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitTitle, { color: theme.colors.text }]}>
                          {habit.name}
                        </Text>
                        <Text style={[styles.habitStreak, { color: getStreakColor(habit.streak) }]}>
                          🔥 {habit.streak} day streak
                        </Text>
                      </View>
                      <View style={styles.habitActions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => handleEditHabit(habit)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDeleteHabit(habit.id!)}
                        />
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                        Weekly Progress
                      </Text>
                      <ProgressBar
                        progress={(habit.completedDates?.length || 0) / (habit.targetDays || 7)}
                        color={theme.colors.primary}
                        style={styles.progressBar}
                      />
                      <Text style={[styles.progressText, { color: theme.colors.text }]}>
                        {(habit.completedDates?.length || 0)} / {habit.targetDays || 7} days
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {
          resetForm();
          setShowHabitDialog(true);
        }}
      />

      {/* Habit Dialog */}
      <Portal>
        <Dialog visible={showHabitDialog} onDismiss={() => setShowHabitDialog(false)}>
          <Dialog.Title>
            {editingHabit ? 'Edit Habit' : 'New Habit'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Habit Name"
              value={currentHabit.name}
              onChangeText={(text) => setCurrentHabit(prev => ({ ...prev, name: text }))}
              style={styles.input}
              placeholder="e.g., Drink 8 glasses of water"
            />

            <TextInput
              label="Target Days Per Week"
              value={currentHabit.targetDays?.toString() || '7'}
              onChangeText={(text) => setCurrentHabit(prev => ({ ...prev, targetDays: parseInt(text) || 7 }))}
              keyboardType="numeric"
              style={styles.input}
              placeholder="7"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowHabitDialog(false)}>
              Cancel
            </Button>
            <Button 
              onPress={handleSaveHabit}
              mode="contained"
              loading={isLoading}
              disabled={isLoading}
            >
              {editingHabit ? 'Update' : 'Save'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitStreak: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  habitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  habitCard: {
    marginBottom: 12,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  habitActions: {
    flexDirection: 'row',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HabitScreen;
