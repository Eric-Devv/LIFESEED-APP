import { useEffect, useState } from 'react';
import { databaseService, User, Goal, Mood, Habit, Journal } from '../database/db';
import { syncService } from '../services/syncService';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to mark records for sync
  const markForSync = async (collection: string, id: number) => {
    try {
      await syncService.markForSync(collection, id);
    } catch (error) {
      console.error(`Failed to mark ${collection} record for sync:`, error);
    }
  };

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await databaseService.initDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  // User methods
  const createUser = async (user: User | Omit<User, 'uid'>) => {
    if (!isInitialized) return null;
    try {
      await databaseService.insertUser(user as User);
      return user as User;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const getUser = async (uid: string) => {
    if (!isInitialized) return null;
    try {
      return await databaseService.getUser(uid);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  const updateUser = async (uid: string, updates: Partial<User>) => {
    if (!isInitialized) return false;
    try {
      await databaseService.updateUser(uid, updates);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  // Goal methods
  const createGoal = async (goal: Omit<Goal, 'id'>) => {
    if (!isInitialized) return null;
    try {
      const id = await databaseService.insertGoal(goal);
      // Mark for sync
      await markForSync('goals', id);
      return { id, ...goal };
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  };

  const getGoals = async (filters?: any) => {
    if (!isInitialized) return [];
    try {
      return await databaseService.getGoals(filters);
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  };

  const updateGoal = async (id: number, updates: Partial<Goal>) => {
    if (!isInitialized) return false;
    try {
      await databaseService.updateGoal(id, updates);
      // Mark for sync
      await markForSync('goals', id);
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  };

  const deleteGoal = async (id: number) => {
    if (!isInitialized) return false;
    try {
      await databaseService.deleteGoal(id);
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  };

  // Mood methods
  const createMood = async (mood: Omit<Mood, 'id'>) => {
    if (!isInitialized) return null;
    try {
      const id = await databaseService.insertMood(mood);
      await markForSync('moods', id);
      return { id, ...mood };
    } catch (error) {
      console.error('Error creating mood:', error);
      return null;
    }
  };

  const getMoods = async (filters?: any) => {
    if (!isInitialized) return [];
    try {
      return await databaseService.getMoods(filters);
    } catch (error) {
      console.error('Error getting moods:', error);
      return [];
    }
  };

  const updateMood = async (id: number, updates: Partial<Mood>) => {
    if (!isInitialized) return false;
    try {
      await databaseService.updateMood(id, updates);
      await markForSync('moods', id);
      return true;
    } catch (error) {
      console.error('Error updating mood:', error);
      return false;
    }
  };

  const deleteMood = async (id: number) => {
    if (!isInitialized) return false;
    try {
      await databaseService.deleteMood(id);
      return true;
    } catch (error) {
      console.error('Error deleting mood:', error);
      return false;
    }
  };

  // Habit methods
  const createHabit = async (habit: Omit<Habit, 'id'>) => {
    if (!isInitialized) return null;
    try {
      const id = await databaseService.insertHabit(habit);
      await markForSync('habits', id);
      return { id, ...habit };
    } catch (error) {
      console.error('Error creating habit:', error);
      return null;
    }
  };

  const getHabits = async (filters?: any) => {
    if (!isInitialized) return [];
    try {
      return await databaseService.getHabits(filters);
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  };

  const updateHabit = async (id: number, updates: Partial<Habit>) => {
    if (!isInitialized) return false;
    try {
      await databaseService.updateHabit(id, updates);
      await markForSync('habits', id);
      return true;
    } catch (error) {
      console.error('Error updating habit:', error);
      return false;
    }
  };

  const deleteHabit = async (id: number) => {
    if (!isInitialized) return false;
    try {
      await databaseService.deleteHabit(id);
      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
  };

  // Journal methods
  const createJournalEntry = async (journal: Omit<Journal, 'id'>) => {
    if (!isInitialized) return null;
    try {
      const id = await databaseService.insertJournalEntry(journal);
      await markForSync('journal', id);
      return { id, ...journal };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return null;
    }
  };

  const getJournalEntries = async (filters?: any) => {
    if (!isInitialized) return [];
    try {
      return await databaseService.getJournalEntries(filters);
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  };

  const updateJournalEntry = async (id: number, updates: Partial<Journal>) => {
    if (!isInitialized) return false;
    try {
      await databaseService.updateJournalEntry(id, updates);
      await markForSync('journal', id);
      return true;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return false;
    }
  };

  const deleteJournalEntry = async (id: number) => {
    if (!isInitialized) return false;
    try {
      await databaseService.deleteJournalEntry(id);
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  };

  // Insight methods
  const createInsight = async (insight: Omit<import('../database/db').Insight, 'id'>) => {
    if (!isInitialized) return null;
    try {
      const id = await databaseService.insertInsight(insight);
      await markForSync('insights', id);
      return { id, ...insight };
    } catch (error) {
      console.error('Error creating insight:', error);
      return null;
    }
  };

  const getInsights = async (filters?: any) => {
    if (!isInitialized) return [];
    try {
      return await databaseService.getInsights(filters);
    } catch (error) {
      console.error('Error getting insights:', error);
      return [];
    }
  };

  const updateInsight = async (id: number, updates: Partial<import('../database/db').Insight>) => {
    if (!isInitialized) return false;
    try {
      await databaseService.updateInsight(id, updates);
      await markForSync('insights', id);
      return true;
    } catch (error) {
      console.error('Error updating insight:', error);
      return false;
    }
  };

  const deleteInsight = async (id: number) => {
    if (!isInitialized) return false;
    try {
      await databaseService.deleteInsight(id);
      return true;
    } catch (error) {
      console.error('Error deleting insight:', error);
      return false;
    }
  };

  return {
    isInitialized,
    isLoading,
    // User methods
    createUser,
    getUser,
    updateUser,
    // Goal methods
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    // Mood methods
    createMood,
    getMoods,
    updateMood,
    deleteMood,
    // Habit methods
    createHabit,
    getHabits,
    updateHabit,
    deleteHabit,
    // Journal methods
    createJournalEntry,
    getJournalEntries,
    updateJournalEntry,
    deleteJournalEntry,
    // Insight methods
    createInsight,
    getInsights,
    updateInsight,
    deleteInsight,
  };
};

