import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { createTables, User, JournalEntry, Goal } from '../database/schema';

export const useDatabase = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('lifeseed.db');
        createTables(database);
        setDb(database);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initDatabase();
  }, []);

  const createUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) return null;

    const id = Date.now().toString();
    const now = new Date().toISOString();

    try {
      await db.runAsync(
        'INSERT INTO users (id, email, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [id, user.email, user.name, now, now]
      );
      return { id, ...user, createdAt: now, updatedAt: now };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) return null;

    const id = Date.now().toString();
    const now = new Date().toISOString();

    try {
      await db.runAsync(
        'INSERT INTO journal_entries (id, userId, title, content, mood, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, entry.userId, entry.title, entry.content, entry.mood, JSON.stringify(entry.tags), now, now]
      );
      return { id, ...entry, createdAt: now, updatedAt: now };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return null;
    }
  };

  const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
    if (!db) return [];

    try {
      const result = await db.getAllAsync(
        'SELECT * FROM journal_entries WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
      return result.map((row: any) => ({
        ...row,
        tags: JSON.parse(row.tags),
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) return null;

    const id = Date.now().toString();
    const now = new Date().toISOString();

    try {
      await db.runAsync(
        'INSERT INTO goals (id, userId, title, description, targetDate, status, progress, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, goal.userId, goal.title, goal.description, goal.targetDate, goal.status, goal.progress, now, now]
      );
      return { id, ...goal, createdAt: now, updatedAt: now };
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  };

  const getGoals = async (userId: string): Promise<Goal[]> => {
    if (!db) return [];

    try {
      const result = await db.getAllAsync(
        'SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
      return result;
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  };

  return {
    db,
    createUser,
    createJournalEntry,
    getJournalEntries,
    createGoal,
    getGoals,
  };
};

