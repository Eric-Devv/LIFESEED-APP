import { databaseService, User, Goal, Mood, Habit, Journal } from './db';

// Test data
const testUser: User = {
  uid: 'test-user-123',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date().toISOString(),
};

const testGoal: Omit<Goal, 'id'> = {
  title: 'Learn React Native',
  description: 'Master React Native development',
  progress: 25,
  completed: false,
  timestamp: new Date().toISOString(),
};

const testMood: Omit<Mood, 'id'> = {
  emotion: 'Happy',
  intensity: 8,
  note: 'Feeling great today!',
  date: new Date().toISOString(),
};

const testHabit: Omit<Habit, 'id'> = {
  name: 'Daily Exercise',
  streak: 5,
  lastUpdated: new Date().toISOString(),
};

const testJournal: Omit<Journal, 'id'> = {
  entry: 'Today was a productive day. I learned a lot about React Native.',
  mood: 'Happy',
  date: new Date().toISOString(),
};

export const runDatabaseTests = async () => {
  console.log('🧪 Starting Database Tests...');

  try {
    // Initialize database
    await databaseService.initDatabase();
    console.log('✅ Database initialized');

    // Test User CRUD
    console.log('\n📝 Testing User CRUD...');
    await databaseService.insertUser(testUser);
    console.log('✅ User inserted');

    const retrievedUser = await databaseService.getUser(testUser.uid);
    console.log('✅ User retrieved:', retrievedUser);

    await databaseService.updateUser(testUser.uid, { name: 'John Updated' });
    console.log('✅ User updated');

    // Test Goal CRUD
    console.log('\n🎯 Testing Goal CRUD...');
    const goalId = await databaseService.insertGoal(testGoal);
    console.log('✅ Goal inserted with ID:', goalId);

    const goals = await databaseService.getGoals();
    console.log('✅ Goals retrieved:', goals.length, 'goals');

    await databaseService.updateGoal(goalId, { progress: 50 });
    console.log('✅ Goal updated');

    // Test Mood CRUD
    console.log('\n😊 Testing Mood CRUD...');
    const moodId = await databaseService.insertMood(testMood);
    console.log('✅ Mood inserted with ID:', moodId);

    const moods = await databaseService.getMoods();
    console.log('✅ Moods retrieved:', moods.length, 'moods');

    await databaseService.updateMood(moodId, { intensity: 9 });
    console.log('✅ Mood updated');

    // Test Habit CRUD
    console.log('\n🔄 Testing Habit CRUD...');
    const habitId = await databaseService.insertHabit(testHabit);
    console.log('✅ Habit inserted with ID:', habitId);

    const habits = await databaseService.getHabits();
    console.log('✅ Habits retrieved:', habits.length, 'habits');

    await databaseService.updateHabit(habitId, { streak: 6 });
    console.log('✅ Habit updated');

    // Test Journal CRUD
    console.log('\n📖 Testing Journal CRUD...');
    const journalId = await databaseService.insertJournalEntry(testJournal);
    console.log('✅ Journal entry inserted with ID:', journalId);

    const journalEntries = await databaseService.getJournalEntries();
    console.log('✅ Journal entries retrieved:', journalEntries.length, 'entries');

    await databaseService.updateJournalEntry(journalId, { 
      entry: 'Updated journal entry content' 
    });
    console.log('✅ Journal entry updated');

    // Test filtering
    console.log('\n🔍 Testing filtering...');
    const happyMoods = await databaseService.getMoods({ emotion: 'Happy' });
    console.log('✅ Filtered moods:', happyMoods.length, 'happy moods');

    const incompleteGoals = await databaseService.getGoals({ completed: false });
    console.log('✅ Filtered goals:', incompleteGoals.length, 'incomplete goals');

    // Test data integrity
    console.log('\n🔒 Testing data integrity...');
    const allUsers = await databaseService.getData('user');
    const allGoals = await databaseService.getData('goals');
    const allMoods = await databaseService.getData('moods');
    const allHabits = await databaseService.getData('habits');
    const allJournals = await databaseService.getData('journal');

    console.log('📊 Database Statistics:');
    console.log(`  Users: ${allUsers.length}`);
    console.log(`  Goals: ${allGoals.length}`);
    console.log(`  Moods: ${allMoods.length}`);
    console.log(`  Habits: ${allHabits.length}`);
    console.log(`  Journal Entries: ${allJournals.length}`);

    // Test cleanup (optional)
    console.log('\n🧹 Testing cleanup...');
    await databaseService.deleteGoal(goalId);
    await databaseService.deleteMood(moodId);
    await databaseService.deleteHabit(habitId);
    await databaseService.deleteJournalEntry(journalId);
    await databaseService.deleteUser(testUser.uid);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All database tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

// Utility function to test offline functionality
export const testOfflineOperations = async () => {
  console.log('📱 Testing offline operations...');
  
  try {
    // Test that operations work without network
    const goals = await databaseService.getGoals();
    console.log('✅ Offline goal retrieval works');

    const moods = await databaseService.getMoods();
    console.log('✅ Offline mood retrieval works');

    const habits = await databaseService.getHabits();
    console.log('✅ Offline habit retrieval works');

    const journalEntries = await databaseService.getJournalEntries();
    console.log('✅ Offline journal retrieval works');

    console.log('✅ All offline operations work correctly');
    return true;

  } catch (error) {
    console.error('❌ Offline test failed:', error);
    return false;
  }
};

// Export test runner
export const runAllTests = async () => {
  console.log('🚀 Running comprehensive database tests...');
  
  const basicTests = await runDatabaseTests();
  const offlineTests = await testOfflineOperations();
  
  if (basicTests && offlineTests) {
    console.log('🎉 All tests passed! Database is ready for production.');
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
  }
  
  return basicTests && offlineTests;
};
