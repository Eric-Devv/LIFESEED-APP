import * as SQLite from 'expo-sqlite';

export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Goal {
  id?: number;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  timestamp: string;
}

export interface Mood {
  id?: number;
  emotion: string;
  intensity: number;
  note: string;
  date: string;
}

export interface Habit {
  id?: number;
  name: string;
  streak: number;
  lastUpdated: string;
}

export interface Journal {
  id?: number;
  entry: string;
  mood: string;
  date: string;
}

export interface Insight {
  id?: number;
  type: string;
  title: string;
  description: string;
  data?: string;
  confidence?: number;
  createdAt: string;
  needsSync?: boolean;
  lastModified?: string;
  firebaseId?: string;
}

export interface DatabaseFilters {
  [key: string]: any;
}

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('lifeseed.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // User table
      `CREATE TABLE IF NOT EXISTS user (
        uid TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )`,
      
      // Goals table
      `CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        timestamp TEXT NOT NULL,
        needsSync BOOLEAN DEFAULT 1,
        lastModified TEXT,
        firebaseId TEXT
      )`,
      
      // Moods table
      `CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emotion TEXT NOT NULL,
        intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
        note TEXT,
        date TEXT NOT NULL,
        needsSync BOOLEAN DEFAULT 1,
        lastModified TEXT,
        firebaseId TEXT
      )`,
      
      // Habits table
      `CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        streak INTEGER DEFAULT 0,
        lastUpdated TEXT NOT NULL,
        needsSync BOOLEAN DEFAULT 1,
        lastModified TEXT,
        firebaseId TEXT
      )`,
      
      // Journal table
      `CREATE TABLE IF NOT EXISTS journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry TEXT NOT NULL,
        mood TEXT,
        date TEXT NOT NULL,
        needsSync BOOLEAN DEFAULT 1,
        lastModified TEXT,
        firebaseId TEXT
      )`,
      
      // Insights table
      `CREATE TABLE IF NOT EXISTS insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        data TEXT,
        confidence REAL DEFAULT 0.7,
        createdAt TEXT NOT NULL,
        needsSync BOOLEAN DEFAULT 1,
        lastModified TEXT,
        firebaseId TEXT
      )`
    ];

    for (const table of tables) {
      await this.db.execAsync(table);
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Call initDatabase() first.');
    }
  }

  async insertData(table: string, data: any): Promise<number> {
    this.ensureInitialized();
    
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
      const result = await this.db!.runAsync(query, values);
      
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error(`Error inserting data into ${table}:`, error);
      throw error;
    }
  }

  async getData(table: string, filters?: DatabaseFilters): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      let query = `SELECT * FROM ${table}`;
      const values: any[] = [];

      if (filters && Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map(key => `${key} = ?`);
        query += ` WHERE ${conditions.join(' AND ')}`;
        values.push(...Object.values(filters));
      }

      const result = await this.db!.getAllAsync(query, values);
      return result;
    } catch (error) {
      console.error(`Error getting data from ${table}:`, error);
      throw error;
    }
  }

  async updateData(table: string, data: any, id: number | string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
      await this.db!.runAsync(query, values);
    } catch (error) {
      console.error(`Error updating data in ${table}:`, error);
      throw error;
    }
  }

  async deleteData(table: string, id: number | string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const query = `DELETE FROM ${table} WHERE id = ?`;
      await this.db!.runAsync(query, [id]);
    } catch (error) {
      console.error(`Error deleting data from ${table}:`, error);
      throw error;
    }
  }

  // User-specific methods
  async insertUser(user: User): Promise<void> {
    await this.insertData('user', user);
  }

  async getUser(uid: string): Promise<User | null> {
    const users = await this.getData('user', { uid });
    return users.length > 0 ? users[0] as User : null;
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    this.ensureInitialized();
    
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), uid];

      const query = `UPDATE user SET ${setClause} WHERE uid = ?`;
      await this.db!.runAsync(query, values);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const query = `DELETE FROM user WHERE uid = ?`;
      await this.db!.runAsync(query, [uid]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Goals-specific methods
  async insertGoal(goal: Omit<Goal, 'id'>): Promise<number> {
    return await this.insertData('goals', goal);
  }

  async getGoals(filters?: DatabaseFilters): Promise<Goal[]> {
    const goals = await this.getData('goals', filters);
    return goals.map(goal => ({
      ...goal,
      completed: Boolean(goal.completed)
    }));
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<void> {
    await this.updateData('goals', updates, id);
  }

  async deleteGoal(id: number): Promise<void> {
    await this.deleteData('goals', id);
  }

  // Moods-specific methods
  async insertMood(mood: Omit<Mood, 'id'>): Promise<number> {
    return await this.insertData('moods', mood);
  }

  async getMoods(filters?: DatabaseFilters): Promise<Mood[]> {
    return await this.getData('moods', filters);
  }

  async updateMood(id: number, updates: Partial<Mood>): Promise<void> {
    await this.updateData('moods', updates, id);
  }

  async deleteMood(id: number): Promise<void> {
    await this.deleteData('moods', id);
  }

  // Habits-specific methods
  async insertHabit(habit: Omit<Habit, 'id'>): Promise<number> {
    return await this.insertData('habits', habit);
  }

  async getHabits(filters?: DatabaseFilters): Promise<Habit[]> {
    return await this.getData('habits', filters);
  }

  async updateHabit(id: number, updates: Partial<Habit>): Promise<void> {
    await this.updateData('habits', updates, id);
  }

  async deleteHabit(id: number): Promise<void> {
    await this.deleteData('habits', id);
  }

  // Journal-specific methods
  async insertJournalEntry(journal: Omit<Journal, 'id'>): Promise<number> {
    return await this.insertData('journal', journal);
  }

  async getJournalEntries(filters?: DatabaseFilters): Promise<Journal[]> {
    return await this.getData('journal', filters);
  }

  async updateJournalEntry(id: number, updates: Partial<Journal>): Promise<void> {
    await this.updateData('journal', updates, id);
  }

  async deleteJournalEntry(id: number): Promise<void> {
    await this.deleteData('journal', id);
  }

  // Insights-specific methods
  async insertInsight(insight: Omit<Insight, 'id'>): Promise<number> {
    return await this.insertData('insights', insight);
  }

  async getInsights(filters?: DatabaseFilters): Promise<Insight[]> {
    const insights = await this.getData('insights', filters);
    return insights.map(insight => ({
      ...insight,
      confidence: insight.confidence || 0.7,
      data: insight.data ? (typeof insight.data === 'string' ? JSON.parse(insight.data) : insight.data) : undefined,
    }));
  }

  async updateInsight(id: number, updates: Partial<Insight>): Promise<void> {
    await this.updateData('insights', updates, id);
  }

  async deleteInsight(id: number): Promise<void> {
    await this.deleteData('insights', id);
  }

  // Utility methods
  async clearTable(table: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const query = `DELETE FROM ${table}`;
      await this.db!.runAsync(query);
    } catch (error) {
      console.error(`Error clearing table ${table}:`, error);
      throw error;
    }
  }

  async getTableInfo(table: string): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      const query = `PRAGMA table_info(${table})`;
      return await this.db!.getAllAsync(query);
    } catch (error) {
      console.error(`Error getting table info for ${table}:`, error);
      throw error;
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();
