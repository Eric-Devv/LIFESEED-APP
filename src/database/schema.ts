// This file is now deprecated in favor of src/database/db.ts
// The new DatabaseService provides a more comprehensive and type-safe approach

export { DatabaseService, databaseService } from './db';
export type { 
  User, 
  Goal, 
  Mood, 
  Habit, 
  Journal, 
  DatabaseFilters 
} from './db';

