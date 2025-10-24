# Lifeseed Database Guide

## Overview

The Lifeseed app uses SQLite for local data storage with a comprehensive `DatabaseService` class that provides offline-first functionality. All data is stored locally and can be synchronized with Firebase when online.

## Database Schema

### Tables Created

1. **user** - User profile information
2. **goals** - Personal development goals
3. **moods** - Mood tracking entries
4. **habits** - Habit tracking with streaks
5. **journal** - Journal entries with mood associations

### Table Structures

#### User Table
```sql
CREATE TABLE user (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
```

#### Goals Table
```sql
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  timestamp TEXT NOT NULL
);
```

#### Moods Table
```sql
CREATE TABLE moods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emotion TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  note TEXT,
  date TEXT NOT NULL
);
```

#### Habits Table
```sql
CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  lastUpdated TEXT NOT NULL
);
```

#### Journal Table
```sql
CREATE TABLE journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry TEXT NOT NULL,
  mood TEXT,
  date TEXT NOT NULL
);
```

## DatabaseService Class

### Core Methods

#### `initDatabase(): Promise<void>`
Initializes the SQLite database and creates all tables if they don't exist.

```typescript
await databaseService.initDatabase();
```

#### `insertData(table: string, data: any): Promise<number>`
Inserts data into any table and returns the new record ID.

```typescript
const id = await databaseService.insertData('goals', {
  title: 'Learn React Native',
  description: 'Master React Native development',
  progress: 0,
  completed: false,
  timestamp: new Date().toISOString()
});
```

#### `getData(table: string, filters?: DatabaseFilters): Promise<any[]>`
Retrieves data from any table with optional filtering.

```typescript
// Get all goals
const allGoals = await databaseService.getData('goals');

// Get completed goals
const completedGoals = await databaseService.getData('goals', { completed: true });
```

#### `updateData(table: string, data: any, id: number | string): Promise<void>`
Updates a record in any table by ID.

```typescript
await databaseService.updateData('goals', { progress: 50 }, goalId);
```

#### `deleteData(table: string, id: number | string): Promise<void>`
Deletes a record from any table by ID.

```typescript
await databaseService.deleteData('goals', goalId);
```

### Specialized Methods

#### User Operations
```typescript
// Insert user
await databaseService.insertUser({
  uid: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date().toISOString()
});

// Get user
const user = await databaseService.getUser('user-123');

// Update user
await databaseService.updateUser('user-123', { name: 'John Updated' });

// Delete user
await databaseService.deleteUser('user-123');
```

#### Goal Operations
```typescript
// Create goal
const goalId = await databaseService.insertGoal({
  title: 'Learn React Native',
  description: 'Master React Native development',
  progress: 0,
  completed: false,
  timestamp: new Date().toISOString()
});

// Get goals
const goals = await databaseService.getGoals();
const incompleteGoals = await databaseService.getGoals({ completed: false });

// Update goal
await databaseService.updateGoal(goalId, { progress: 50 });

// Delete goal
await databaseService.deleteGoal(goalId);
```

#### Mood Operations
```typescript
// Record mood
const moodId = await databaseService.insertMood({
  emotion: 'Happy',
  intensity: 8,
  note: 'Feeling great today!',
  date: new Date().toISOString()
});

// Get moods
const moods = await databaseService.getMoods();
const happyMoods = await databaseService.getMoods({ emotion: 'Happy' });

// Update mood
await databaseService.updateMood(moodId, { intensity: 9 });

// Delete mood
await databaseService.deleteMood(moodId);
```

#### Habit Operations
```typescript
// Create habit
const habitId = await databaseService.insertHabit({
  name: 'Daily Exercise',
  streak: 0,
  lastUpdated: new Date().toISOString()
});

// Get habits
const habits = await databaseService.getHabits();

// Update habit
await databaseService.updateHabit(habitId, { streak: 5 });

// Delete habit
await databaseService.deleteHabit(habitId);
```

#### Journal Operations
```typescript
// Create journal entry
const journalId = await databaseService.insertJournalEntry({
  entry: 'Today was a productive day. I learned a lot about React Native.',
  mood: 'Happy',
  date: new Date().toISOString()
});

// Get journal entries
const entries = await databaseService.getJournalEntries();

// Update journal entry
await databaseService.updateJournalEntry(journalId, { 
  entry: 'Updated content' 
});

// Delete journal entry
await databaseService.deleteJournalEntry(journalId);
```

## Using the Database Hook

The `useDatabase` hook provides a React-friendly interface to the database:

```typescript
import { useDatabase } from '../hooks/useDatabase';

const MyComponent = () => {
  const {
    isInitialized,
    isLoading,
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    // ... other methods
  } = useDatabase();

  if (isLoading) return <Text>Loading...</Text>;
  if (!isInitialized) return <Text>Database not ready</Text>;

  // Use database methods...
};
```

## Offline Functionality

All database operations work offline:

- ✅ **Create** - Insert new records
- ✅ **Read** - Query existing data
- ✅ **Update** - Modify existing records
- ✅ **Delete** - Remove records
- ✅ **Filter** - Search with conditions
- ✅ **Relations** - Link related data

## Data Types

### User
```typescript
interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
}
```

### Goal
```typescript
interface Goal {
  id?: number;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  timestamp: string;
}
```

### Mood
```typescript
interface Mood {
  id?: number;
  emotion: string;
  intensity: number; // 1-10
  note: string;
  date: string;
}
```

### Habit
```typescript
interface Habit {
  id?: number;
  name: string;
  streak: number;
  lastUpdated: string;
}
```

### Journal
```typescript
interface Journal {
  id?: number;
  entry: string;
  mood: string;
  date: string;
}
```

## Testing

### Run Database Tests
```typescript
import { runAllTests } from '../database/test';

// Run comprehensive tests
const success = await runAllTests();
```

### Test Individual Operations
```typescript
import { runDatabaseTests, testOfflineOperations } from '../database/test';

// Test basic CRUD operations
await runDatabaseTests();

// Test offline functionality
await testOfflineOperations();
```

## Best Practices

### 1. Always Check Initialization
```typescript
const { isInitialized, createGoal } = useDatabase();

if (!isInitialized) {
  return <Text>Database not ready</Text>;
}

// Safe to use database methods
```

### 2. Handle Errors Gracefully
```typescript
try {
  const goal = await createGoal(goalData);
  if (goal) {
    // Success
  }
} catch (error) {
  console.error('Failed to create goal:', error);
  // Handle error
}
```

### 3. Use Filters for Performance
```typescript
// Instead of getting all data
const allGoals = await getGoals();

// Use filters to get specific data
const incompleteGoals = await getGoals({ completed: false });
```

### 4. Batch Operations
```typescript
// Load related data together
const [goals, moods, habits] = await Promise.all([
  getGoals(),
  getMoods(),
  getHabits()
]);
```

## Migration and Updates

The database automatically creates tables on first run. For schema updates:

1. Add new columns with `ALTER TABLE` statements
2. Update the `createTables()` method
3. Handle data migration if needed
4. Test thoroughly before deployment

## Performance Considerations

- **Indexes**: Add indexes for frequently queried columns
- **Batch Operations**: Use transactions for multiple operations
- **Data Cleanup**: Regularly clean up old data
- **Memory Management**: Close database connections when done

## Security

- **Input Validation**: Always validate user input
- **SQL Injection**: Use parameterized queries (already implemented)
- **Data Encryption**: Consider encrypting sensitive data
- **Access Control**: Implement proper user permissions

The database service is designed to be robust, performant, and easy to use while maintaining data integrity and supporting offline functionality.
