import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  TextInput, 
  Button, 
  ProgressBar,
  FAB,
  Portal,
  Dialog,
  Paragraph,
  IconButton,
  Chip,
  Surface
} from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../hooks/useDatabase';
import SuccessAnimation from '../components/SuccessAnimation';
import { scale, moderateScale, getPadding } from '../utils/responsive';

interface GoalTrackerScreenProps {
  navigation: any;
}

interface Goal {
  id?: number;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  timestamp: string;
  targetDate?: string;
  reminderTime?: string;
}

const GoalTrackerScreen: React.FC<GoalTrackerScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { createGoal, getGoals, updateGoal, deleteGoal } = useDatabase();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Goal>({
    title: '',
    description: '',
    progress: 0,
    completed: false,
    timestamp: new Date().toISOString(),
    targetDate: '',
    reminderTime: ''
  });
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadGoals();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') await Notifications.requestPermissionsAsync();
  };

  const loadGoals = async () => {
    try {
      const goalEntries = await getGoals();
      setGoals(goalEntries);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const resetForm = () => {
    setCurrentGoal({
      title: '',
      description: '',
      progress: 0,
      completed: false,
      timestamp: new Date().toISOString(),
      targetDate: '',
      reminderTime: ''
    });
    setEditingGoal(null);
  };

  const handleSaveGoal = async () => {
    if (!currentGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }
    setIsLoading(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id!, { ...currentGoal });
      } else {
        await createGoal(currentGoal);
      }
      await loadGoals();
      resetForm();
      setShowGoalDialog(false);
      setShowSuccess(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setShowSuccess(false);
        });
      }, 2000);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setCurrentGoal(goal);
    setShowGoalDialog(true);
  };

  const handleDeleteGoal = (goalId: number) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteGoal(goalId); await loadGoals(); } 
        catch (error) { Alert.alert('Error', 'Failed to delete goal'); }
      }}
    ]);
  };

  const handleUpdateProgress = async (goalId: number, newProgress: number) => {
    try {
      await updateGoal(goalId, { progress: newProgress, completed: newProgress >= 100 });
      await loadGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.completed).length;
    const inProgress = goals.filter(g => !g.completed && g.progress > 0).length;
    const notStarted = goals.filter(g => !g.completed && g.progress === 0).length;
    return { total, completed, inProgress, notStarted };
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#4CAF50';
    if (progress >= 75) return '#8BC34A';
    if (progress >= 50) return '#FFC107';
    if (progress >= 25) return '#FF9800';
    return '#F44336';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString();
  };

  const stats = getGoalStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {showSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: fadeAnim }]}>
          <SuccessAnimation size={scale(120)} />
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={[styles.content, { padding: getPadding() }]} showsVerticalScrollIndicator={false}>
        <Title style={[styles.title, { color: theme.colors.text, fontSize: moderateScale(28, 0.3) }]}>Goal Tracker</Title>

        {/* Stats Overview */}
        <Surface style={[styles.modernCard, { backgroundColor: theme.colors.surface, borderRadius: scale(20), marginBottom: scale(16) }]}>
          <Card.Content>
            <Title>Goal Statistics</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Total Goals</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.completed}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.inProgress}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.notStarted}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Not Started</Text>
              </View>
            </View>
          </Card.Content>
        </Surface>

        {/* Goals List */}
        <Surface style={[styles.modernCard, { backgroundColor: theme.colors.surface, borderRadius: scale(20), marginBottom: scale(16) }]}>
          <View style={{ padding: scale(16) }}>
            <Title style={{ fontSize: moderateScale(20, 0.3), marginBottom: scale(16) }}>Your Goals</Title>
            {goals.length === 0 ? (
              <Paragraph style={[styles.emptyText, { color: theme.colors.text, fontSize: moderateScale(14, 0.3) }]}>
                No goals set yet. Tap the + button to create your first goal!
              </Paragraph>
            ) : (
              goals.map(goal => (
                <Surface key={goal.id} style={[styles.goalCard, { backgroundColor: theme.colors.background, borderRadius: scale(16), marginBottom: scale(12) }]}>
                  <View style={{ padding: scale(16) }}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalInfo}>
                        <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{goal.title}</Text>
                        {goal.description && <Text style={[styles.goalDescription, { color: theme.colors.text }]}>{goal.description}</Text>}
                        <Text style={[styles.goalDate, { color: theme.colors.text }]}>Target: {formatDate(goal.targetDate || '')}</Text>
                      </View>
                      <View style={styles.goalActions}>
                        <IconButton icon="pencil" size={20} onPress={() => handleEditGoal(goal)} />
                        <IconButton icon="delete" size={20} onPress={() => handleDeleteGoal(goal.id!)} />
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, { color: theme.colors.text }]}>Progress</Text>
                        <Text style={[styles.progressText, { color: getProgressColor(goal.progress) }]}>{goal.progress}%</Text>
                      </View>
                      <ProgressBar progress={goal.progress / 100} color={getProgressColor(goal.progress)} style={styles.progressBar} />
                    </View>

                    <View style={styles.progressButtons}>
                      {[25, 50, 75, 100].map(value => (
                        <Button
                          key={value}
                          mode={goal.progress === value ? 'contained' : 'outlined'}
                          onPress={() => handleUpdateProgress(goal.id!, value)}
                          style={styles.progressButton}
                          compact
                        >
                          {value}%
                        </Button>
                      ))}
                    </View>

                    <View style={styles.statusContainer}>
                      <Chip
                        icon={goal.completed ? 'check' : 'clock'}
                        style={[styles.statusChip, { backgroundColor: goal.completed ? '#4CAF50' : '#FF9800' }]}
                        textStyle={{ color: '#fff' }}
                      >
                        {goal.completed ? 'Completed' : 'In Progress'}
                      </Chip>
                    </View>
                  </View>
                </Surface>
              ))
            )}
          </View>
        </Surface>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => { resetForm(); setShowGoalDialog(true); }}
      />

      {/* Goal Dialog */}
      <Portal>
        <Dialog visible={showGoalDialog} onDismiss={() => setShowGoalDialog(false)}>
          <Dialog.Title>{editingGoal ? 'Edit Goal' : 'New Goal'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Goal Title"
              value={currentGoal.title}
              onChangeText={text => setCurrentGoal(prev => ({ ...prev, title: text }))}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={currentGoal.description}
              onChangeText={text => setCurrentGoal(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <TextInput
              label="Target Date (YYYY-MM-DD)"
              value={currentGoal.targetDate}
              onChangeText={text => setCurrentGoal(prev => ({ ...prev, targetDate: text }))}
              style={styles.input}
            />
            <TextInput
              label="Reminder Time (HH:MM)"
              value={currentGoal.reminderTime}
              onChangeText={text => setCurrentGoal(prev => ({ ...prev, reminderTime: text }))}
              style={styles.input}
            />

            <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
              Initial Progress: {currentGoal.progress}%
            </Text>
            <View style={styles.progressButtons}>
              {[0, 25, 50, 75, 100].map(value => (
                <Button
                  key={value}
                  mode={currentGoal.progress === value ? 'contained' : 'outlined'}
                  onPress={() => setCurrentGoal(prev => ({ ...prev, progress: value }))}
                  style={styles.progressButton}
                  compact
                >
                  {value}%
                </Button>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowGoalDialog(false)}>Cancel</Button>
            <Button onPress={handleSaveGoal} mode="contained" loading={isLoading} disabled={isLoading}>
              {editingGoal ? 'Update' : 'Save'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: scale(80) },
  title: { fontWeight: '700', textAlign: 'center', marginBottom: scale(24), letterSpacing: 0.5 },
  modernCard: { elevation: 4, overflow: 'hidden' },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, opacity: 0.7, textAlign: 'center' },
  goalCard: { marginBottom: 12, elevation: 2 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  goalDescription: { fontSize: 14, opacity: 0.8, marginBottom: 4 },
  goalDate: { fontSize: 12, opacity: 0.6 },
  goalActions: { flexDirection: 'row' },
  progressContainer: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: 'bold' },
  progressText: { fontSize: 14, fontWeight: 'bold' },
  progressBar: { height: 8, borderRadius: 4 },
  progressButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressButton: { flex: 1, marginHorizontal: 2 },
  statusContainer: { alignItems: 'flex-start' },
  statusChip: { marginTop: 8 },
  input: { marginBottom: 16 },
  emptyText: { textAlign: 'center', fontStyle: 'italic', opacity: 0.7, marginTop: 16 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default GoalTrackerScreen;
