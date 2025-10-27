import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  TextInput, 
  Button, 
  Chip,
  FAB,
  List,
  Portal,
  Dialog,
  Paragraph,
  IconButton
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../hooks/useDatabase';

interface JournalScreenProps {
  navigation: any;
}

interface JournalEntry {
  id?: number;
  entry: string;
  mood: string;
  date: string;
  tags: string[];
}

const EMOTION_TAGS = [
  'Happy', 'Sad', 'Excited', 'Anxious', 'Grateful', 'Frustrated',
  'Peaceful', 'Overwhelmed', 'Confident', 'Lonely', 'Motivated', 'Tired'
];

const JournalScreen: React.FC<JournalScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { createJournalEntry, getJournalEntries, updateJournalEntry, deleteJournalEntry } = useDatabase();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>({
    entry: '',
    mood: '',
    date: selectedDate,
    tags: []
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    setCurrentEntry(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const loadEntries = async () => {
    try {
      const journalEntries = await getJournalEntries();
      setEntries(journalEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.entry.trim()) {
      Alert.alert('Error', 'Please enter some text for your journal entry');
      return;
    }

    setIsLoading(true);
    try {
      if (editingEntry) {
        // Update existing entry
        await updateJournalEntry(editingEntry.id!, {
          entry: currentEntry.entry,
          mood: currentEntry.mood,
          date: currentEntry.date,
          tags: currentEntry.tags.join(',')
        });
      } else {
        // Create new entry
        await createJournalEntry({
          entry: currentEntry.entry,
          mood: currentEntry.mood,
          date: currentEntry.date,
          tags: currentEntry.tags.join(',')
        });
      }

      await loadEntries();
      resetForm();
      setShowEntryDialog(false);
      Alert.alert('Success', 'Journal entry saved successfully!');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setCurrentEntry({
      entry: entry.entry,
      mood: entry.mood,
      date: entry.date,
      tags: typeof entry.tags === 'string' ? entry.tags.split(',') : entry.tags
    });
    setShowEntryDialog(true);
  };

  const handleDeleteEntry = (entryId: number) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJournalEntry(entryId);
              await loadEntries();
              Alert.alert('Success', 'Journal entry deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete journal entry');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setCurrentEntry({
      entry: '',
      mood: '',
      date: selectedDate,
      tags: []
    });
    setEditingEntry(null);
  };

  const toggleTag = (tag: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getEntriesForDate = (date: string) => {
    return entries.filter(entry => entry.date === date);
  };

  const getMarkedDates = () => {
    const marked: any = {};
    entries.forEach(entry => {
      marked[entry.date] = {
        marked: true,
        dotColor: theme.colors.primary
      };
    });
    return marked;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={[styles.title, { color: theme.colors.text }]}>
          Daily Journal
        </Title>

        {/* Calendar */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>Calendar</Title>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                ...getMarkedDates(),
                [selectedDate]: {
                  selected: true,
                  selectedColor: theme.colors.primary
                }
              }}
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

        {/* Selected Date Entries */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>{formatDate(selectedDate)}</Title>
            {getEntriesForDate(selectedDate).length === 0 ? (
              <Paragraph style={[styles.emptyText, { color: theme.colors.text }]}>
                No entries for this date. Tap the + button to add one.
              </Paragraph>
            ) : (
              getEntriesForDate(selectedDate).map((entry) => (
                <Card key={entry.id} style={[styles.entryCard, { backgroundColor: theme.colors.background }]}>
                  <Card.Content>
                    <View style={styles.entryHeader}>
                      <Text style={[styles.entryMood, { color: theme.colors.primary }]}>
                        {entry.mood || 'No mood'}
                      </Text>
                      <View style={styles.entryActions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => handleEditEntry(entry)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDeleteEntry(entry.id!)}
                        />
                      </View>
                    </View>
                    <Text style={[styles.entryText, { color: theme.colors.text }]}>
                      {entry.entry}
                    </Text>
                    {entry.tags && (
                      <View style={styles.tagsContainer}>
                        {(typeof entry.tags === 'string' ? entry.tags.split(',') : entry.tags)
                          .filter(tag => tag.trim())
                          .map((tag, index) => (
                            <Chip
                              key={index}
                              style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}
                              textStyle={{ color: theme.colors.primary }}
                            >
                              {tag.trim()}
                            </Chip>
                          ))
                        }
                      </View>
                    )}
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
          setShowEntryDialog(true);
        }}
      />

      {/* Entry Dialog */}
      <Portal>
        <Dialog visible={showEntryDialog} onDismiss={() => setShowEntryDialog(false)}>
          <Dialog.Title>
            {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="How are you feeling today?"
              value={currentEntry.mood}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, mood: text }))}
              style={styles.input}
              placeholder="e.g., Happy, Grateful, Excited"
            />

            <TextInput
              label="Journal Entry"
              value={currentEntry.entry}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, entry: text }))}
              multiline
              numberOfLines={6}
              style={styles.input}
              placeholder="Write about your day, thoughts, or experiences..."
            />

            <Text style={[styles.tagsLabel, { color: theme.colors.text }]}>
              Emotion Tags:
            </Text>
            <View style={styles.tagsContainer}>
              {EMOTION_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  selected={currentEntry.tags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tag,
                    currentEntry.tags.includes(tag) && {
                      backgroundColor: theme.colors.primary
                    }
                  ]}
                  textStyle={{
                    color: currentEntry.tags.includes(tag) ? '#ffffff' : theme.colors.text
                  }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEntryDialog(false)}>
              Cancel
            </Button>
            <Button 
              onPress={handleSaveEntry}
              mode="contained"
              loading={isLoading}
              disabled={isLoading}
            >
              {editingEntry ? 'Update' : 'Save'}
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
  entryCard: {
    marginBottom: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryMood: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryActions: {
    flexDirection: 'row',
  },
  entryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default JournalScreen;
