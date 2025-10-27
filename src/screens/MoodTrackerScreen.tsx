import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Button, 
  Chip,
  FAB,
  Portal,
  Dialog,
  Paragraph
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../hooks/useDatabase';

interface MoodTrackerScreenProps {
  navigation: any;
}

interface MoodEntry {
  id?: number;
  emotion: string;
  intensity: number;
  note: string;
  date: string;
}

const EMOTIONS = [
  { name: 'Happy', emoji: '😊', color: '#FFD700' },
  { name: 'Sad', emoji: '😢', color: '#4169E1' },
  { name: 'Excited', emoji: '🤩', color: '#FF6347' },
  { name: 'Anxious', emoji: '😰', color: '#FF8C00' },
  { name: 'Grateful', emoji: '🙏', color: '#32CD32' },
  { name: 'Frustrated', emoji: '😤', color: '#DC143C' },
  { name: 'Peaceful', emoji: '😌', color: '#87CEEB' },
  { name: 'Overwhelmed', emoji: '😵', color: '#8B008B' },
  { name: 'Confident', emoji: '😎', color: '#00CED1' },
  { name: 'Lonely', emoji: '😔', color: '#708090' },
  { name: 'Motivated', emoji: '💪', color: '#FF1493' },
  { name: 'Tired', emoji: '😴', color: '#696969' }
];

const screenWidth = Dimensions.get('window').width;

const MoodTrackerScreen: React.FC<MoodTrackerScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { createMood, getMoods, updateMood, deleteMood } = useDatabase();
  
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [note, setNote] = useState<string>('');
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const moodEntries = await getMoods();
      setMoods(moodEntries);
    } catch (error) {
      console.error('Error loading moods:', error);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedEmotion) {
      Alert.alert('Error', 'Please select an emotion');
      return;
    }

    setIsLoading(true);
    try {
      await createMood({
        emotion: selectedEmotion,
        intensity,
        note,
        date: new Date().toISOString()
      });

      await loadMoods();
      resetForm();
      setShowMoodDialog(false);
      Alert.alert('Success', 'Mood recorded successfully!');
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save mood');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmotion('');
    setIntensity(5);
    setNote('');
  };

  const getWeeklyMoodData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const weeklyMoods = last7Days.map(date => {
      const dayMoods = moods.filter(mood => mood.date.startsWith(date));
      const avgIntensity = dayMoods.length > 0 
        ? dayMoods.reduce((sum, mood) => sum + mood.intensity, 0) / dayMoods.length
        : 0;
      return avgIntensity;
    });

    return {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        data: weeklyMoods,
        color: (opacity = 1) => theme.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
        strokeWidth: 2
      }]
    };
  };

  const getEmotionStats = () => {
    const emotionCounts: { [key: string]: number } = {};
    moods.forEach(mood => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
    });
    return emotionCounts;
  };

  const getAverageIntensity = () => {
    if (moods.length === 0) return 0;
    const total = moods.reduce((sum, mood) => sum + mood.intensity, 0);
    return (total / moods.length).toFixed(1);
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => theme.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => theme.colors.text + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={[styles.title, { color: theme.colors.text }]}>
          Mood Tracker
        </Title>

        {/* Stats Overview */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>Your Mood Stats</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {moods.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                  Total Entries
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {getAverageIntensity()}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                  Avg Intensity
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Weekly Trend Chart */}
        {moods.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title>Weekly Mood Trend</Title>
              <LineChart
                data={getWeeklyMoodData()}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        {/* Emotion Distribution */}
        {moods.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title>Emotion Distribution</Title>
              <View style={styles.emotionGrid}>
                {Object.entries(getEmotionStats()).map(([emotion, count]) => {
                  const emotionData = EMOTIONS.find(e => e.name === emotion);
                  return (
                    <View key={emotion} style={styles.emotionItem}>
                      <Text style={styles.emotionEmoji}>
                        {emotionData?.emoji || '😊'}
                      </Text>
                      <Text style={[styles.emotionName, { color: theme.colors.text }]}>
                        {emotion}
                      </Text>
                      <Text style={[styles.emotionCount, { color: theme.colors.primary }]}>
                        {count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recent Moods */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>Recent Moods</Title>
            {moods.length === 0 ? (
              <Paragraph style={[styles.emptyText, { color: theme.colors.text }]}>
                No moods recorded yet. Tap the + button to add your first mood!
              </Paragraph>
            ) : (
              moods.slice(0, 5).map((mood) => {
                const emotionData = EMOTIONS.find(e => e.name === mood.emotion);
                return (
                  <View key={mood.id} style={styles.moodItem}>
                    <View style={styles.moodInfo}>
                      <Text style={styles.moodEmoji}>
                        {emotionData?.emoji || '😊'}
                      </Text>
                      <View style={styles.moodDetails}>
                        <Text style={[styles.moodEmotion, { color: theme.colors.text }]}>
                          {mood.emotion}
                        </Text>
                        <Text style={[styles.moodDate, { color: theme.colors.text }]}>
                          {new Date(mood.date).toLocaleDateString()}
                        </Text>
                        {mood.note && (
                          <Text style={[styles.moodNote, { color: theme.colors.text }]}>
                            {mood.note}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.intensityBar}>
                      <View 
                        style={[
                          styles.intensityFill, 
                          { 
                            width: `${(mood.intensity / 10) * 100}%`,
                            backgroundColor: emotionData?.color || theme.colors.primary
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.intensityText, { color: theme.colors.text }]}>
                      {mood.intensity}/10
                    </Text>
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => setShowMoodDialog(true)}
      />

      {/* Mood Entry Dialog */}
      <Portal>
        <Dialog visible={showMoodDialog} onDismiss={() => setShowMoodDialog(false)}>
          <Dialog.Title>How are you feeling?</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.emotionLabel, { color: theme.colors.text }]}>
              Select Emotion:
            </Text>
            <View style={styles.emotionGrid}>
              {EMOTIONS.map((emotion) => (
                <Button
                  key={emotion.name}
                  mode={selectedEmotion === emotion.name ? 'contained' : 'outlined'}
                  onPress={() => setSelectedEmotion(emotion.name)}
                  style={[
                    styles.emotionButton,
                    selectedEmotion === emotion.name && {
                      backgroundColor: emotion.color
                    }
                  ]}
                  textColor={selectedEmotion === emotion.name ? '#ffffff' : emotion.color}
                >
                  {emotion.emoji} {emotion.name}
                </Button>
              ))}
            </View>

            <Text style={[styles.intensityLabel, { color: theme.colors.text }]}>
              Intensity: {intensity}/10
            </Text>
            <View style={styles.intensitySlider}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <Button
                  key={value}
                  mode={intensity === value ? 'contained' : 'outlined'}
                  onPress={() => setIntensity(value)}
                  style={styles.intensityButton}
                  compact
                >
                  {value}
                </Button>
              ))}
            </View>

            <TextInput
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Add any additional thoughts..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMoodDialog(false)}>
              Cancel
            </Button>
            <Button 
              onPress={handleSaveMood}
              mode="contained"
              loading={isLoading}
              disabled={isLoading || !selectedEmotion}
            >
              Save Mood
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  emotionItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emotionName: {
    fontSize: 12,
    textAlign: 'center',
  },
  emotionCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  moodDetails: {
    flex: 1,
  },
  moodEmotion: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  moodNote: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  intensityBar: {
    width: 60,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  intensityFill: {
    height: '100%',
    borderRadius: 4,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  emotionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emotionButton: {
    margin: 2,
    minWidth: 80,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  intensitySlider: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  intensityButton: {
    width: '9%',
    minWidth: 30,
  },
  input: {
    marginTop: 16,
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

export default MoodTrackerScreen;
