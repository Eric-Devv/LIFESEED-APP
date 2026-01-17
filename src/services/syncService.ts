import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import NetInfo from '@react-native-community/netinfo';
import { db, auth as firebaseAuth } from '../firebase/config';
import { databaseService } from '../database/db';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingSync: number;
  isSyncing: boolean;
}

export interface SyncRecord {
  id: string;
  collection: string;
  data: any;
  needsSync: boolean;
  lastModified: string;
  firebaseId?: string;
}

export interface ConflictResolution {
  localWins: number;
  remoteWins: number;
  merged: number;
}

class SyncService {
  private isOnline = false;
  private isSyncing = false;
  private lastSync: string | null = null;
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private backgroundTaskName = 'SYNC_DATA';

  constructor() {
    this.initializeNetworkListener();
    this.registerBackgroundTask();
  }

  // Network status monitoring
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (!wasOnline && this.isOnline) {
        // Just came online, trigger sync
        this.syncData();
      }
      
      this.notifyListeners();
    });
  }

  // Background task registration
  private registerBackgroundTask() {
    TaskManager.defineTask(this.backgroundTaskName, async () => {
      try {
        if (this.isOnline) {
          await this.syncData();
        }
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Background sync failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register background fetch
    BackgroundFetch.registerTaskAsync(this.backgroundTaskName, {
      minimumInterval: 30 * 60 * 1000, // 30 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  // Status listeners
  addSyncListener(callback: (status: SyncStatus) => void) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    const status: SyncStatus = {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingSync: 0, // Will be calculated
      isSyncing: this.isSyncing,
    };
    
    this.syncListeners.forEach(callback => callback(status));
  }

  // Initialize sync service
  async initialize() {
    try {
      await databaseService.initDatabase();
      await this.updatePendingSyncCount();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  // Pull data from Firestore to SQLite on sign-in
  async pullUserData(uid: string): Promise<boolean> {
    try {
      console.log('Pulling user data from Firestore...');
      
      const collections = ['goals', 'moods', 'habits', 'journal'];
      let totalPulled = 0;

      for (const collectionName of collections) {
        const firestoreData = await this.getFirestoreData(uid, collectionName);
        
        for (const record of firestoreData) {
          await this.mergeFirestoreRecord(collectionName, record);
          totalPulled++;
        }
      }

      console.log(`Pulled ${totalPulled} records from Firestore`);
      this.lastSync = new Date().toISOString();
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Failed to pull user data:', error);
      return false;
    }
  }

  // Get data from Firestore
  private async getFirestoreData(uid: string, collectionName: string): Promise<any[]> {
    try {
      const userDataRef = collection(db, 'users', uid, 'data', collectionName);
      const snapshot = await getDocs(userDataRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        firebaseId: doc.id,
        needsSync: false,
        lastModified: doc.data().lastModified?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      console.error(`Failed to get Firestore data for ${collectionName}:`, error);
      return [];
    }
  }

  // Merge Firestore record into SQLite
  private async mergeFirestoreRecord(collectionName: string, record: any) {
    try {
      const { firebaseId, lastModified, ...data } = record;
      
      // Check if record exists locally
      const existingRecords = await databaseService.getData(collectionName, { firebaseId });
      
      if (existingRecords.length > 0) {
        // Update existing record
        const localRecord = existingRecords[0];
        const localTime = new Date(localRecord.lastModified || 0);
        const remoteTime = new Date(lastModified);
        
        if (remoteTime > localTime) {
          // Remote is newer, update local
          await databaseService.updateData(collectionName, {
            ...data,
            lastModified,
            needsSync: false,
          }, localRecord.id);
        }
      } else {
        // Insert new record
        await databaseService.insertData(collectionName, {
          ...data,
          firebaseId,
          lastModified,
          needsSync: false,
        });
      }
    } catch (error) {
      console.error(`Failed to merge Firestore record for ${collectionName}:`, error);
    }
  }

  // Mark record as needing sync
  async markForSync(collectionName: string, recordId: number | string) {
    try {
      await databaseService.updateData(collectionName, {
        needsSync: true,
        lastModified: new Date().toISOString(),
      }, recordId);
      
      await this.updatePendingSyncCount();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to mark record for sync:', error);
    }
  }

  // Main sync function
  async syncData(): Promise<ConflictResolution> {
    if (this.isSyncing || !this.isOnline) {
      return { localWins: 0, remoteWins: 0, merged: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      console.log('Starting data sync...');
      
      const resolution: ConflictResolution = {
        localWins: 0,
        remoteWins: 0,
        merged: 0,
      };

      // Get current user (you'll need to implement this)
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Sync each collection
      const collections = ['goals', 'moods', 'habits', 'journal'];
      
      for (const collectionName of collections) {
        const result = await this.syncCollection(currentUser.uid, collectionName);
        resolution.localWins += result.localWins;
        resolution.remoteWins += result.remoteWins;
        resolution.merged += result.merged;
      }

      this.lastSync = new Date().toISOString();
      await this.updatePendingSyncCount();
      
      console.log('Sync completed:', resolution);
      return resolution;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Sync individual collection
  private async syncCollection(uid: string, collectionName: string): Promise<ConflictResolution> {
    const resolution: ConflictResolution = { localWins: 0, remoteWins: 0, merged: 0 };
    
    try {
      // Get local records that need sync
      const localRecords = await databaseService.getData(collectionName, { needsSync: true });
      
      // Get remote records
      const remoteRecords = await this.getFirestoreData(uid, collectionName);
      
      // Create batch for Firestore operations
      const batch = writeBatch(db);
      
      // Upload local changes
      for (const localRecord of localRecords) {
        const remoteRecord = remoteRecords.find(r => r.firebaseId === localRecord.firebaseId);
        
        if (remoteRecord) {
          // Conflict resolution
          const localTime = new Date(localRecord.lastModified || 0);
          const remoteTime = new Date(remoteRecord.lastModified);
          
          if (localTime > remoteTime) {
            // Local wins
            await this.uploadRecord(uid, collectionName, localRecord, batch);
            resolution.localWins++;
          } else if (remoteTime > localTime) {
            // Remote wins
            await this.mergeFirestoreRecord(collectionName, remoteRecord);
            resolution.remoteWins++;
          } else {
            // Same timestamp, merge data
            const mergedData = this.mergeData(localRecord, remoteRecord);
            await this.uploadRecord(uid, collectionName, mergedData, batch);
            await this.mergeFirestoreRecord(collectionName, mergedData);
            resolution.merged++;
          }
        } else {
          // New record, upload to Firestore
          await this.uploadRecord(uid, collectionName, localRecord, batch);
          resolution.localWins++;
        }
      }
      
      // Commit batch
      await batch.commit();
      
      // Mark all synced records as clean
      for (const record of localRecords) {
        await databaseService.updateData(collectionName, { needsSync: false }, record.id);
      }
      
    } catch (error) {
      console.error(`Failed to sync collection ${collectionName}:`, error);
    }
    
    return resolution;
  }

  // Upload record to Firestore
  private async uploadRecord(uid: string, collectionName: string, record: any, batch: any) {
    const { id, needsSync, ...data } = record;
    const docRef = doc(db, 'users', uid, 'data', collectionName, record.firebaseId || id.toString());
    
    batch.set(docRef, {
      ...data,
      lastModified: serverTimestamp(),
    });
  }

  // Merge conflicting data
  private mergeData(local: any, remote: any): any {
    // Simple merge strategy - you can implement more sophisticated logic
    return {
      ...local,
      ...remote,
      lastModified: new Date().toISOString(),
    };
  }

  // Manual backup
  async backupNow(): Promise<boolean> {
    try {
      console.log('Starting manual backup...');
      const result = await this.syncData();
      console.log('Manual backup completed:', result);
      return true;
    } catch (error) {
      console.error('Manual backup failed:', error);
      return false;
    }
  }

  // Push to Firebase (alias for backupNow)
  async pushToFirebase(): Promise<boolean> {
    return await this.backupNow();
  }

  // Manual restore
  async restoreData(): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      console.log('Starting manual restore...');
      const success = await this.pullUserData(currentUser.uid);
      console.log('Manual restore completed:', success);
      return success;
    } catch (error) {
      console.error('Manual restore failed:', error);
      return false;
    }
  }

  // Pull from Firebase (alias for restoreData)
  async pullFromFirebase(): Promise<boolean> {
    return await this.restoreData();
  }

  // Get pending sync count
  private async updatePendingSyncCount() {
    try {
      const collections = ['goals', 'moods', 'habits', 'journal'];
      let totalPending = 0;
      
      for (const collectionName of collections) {
        const pendingRecords = await databaseService.getData(collectionName, { needsSync: true });
        totalPending += pendingRecords.length;
      }
      
      return totalPending;
    } catch (error) {
      console.error('Failed to update pending sync count:', error);
      return 0;
    }
  }

  // Get current user (implement based on your auth system)
  private async getCurrentUser(): Promise<{ uid: string } | null> {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        return { uid: currentUser.uid };
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingSync: 0, // Will be calculated asynchronously
      isSyncing: this.isSyncing,
    };
  }

  // Force sync
  async forceSync(): Promise<ConflictResolution> {
    return await this.syncData();
  }

  // Clear all sync flags
  async clearSyncFlags() {
    try {
      const collections = ['goals', 'moods', 'habits', 'journal'];
      
      for (const collectionName of collections) {
        const records = await databaseService.getData(collectionName, { needsSync: true });
        for (const record of records) {
          await databaseService.updateData(collectionName, { needsSync: false }, record.id);
        }
      }
      
      await this.updatePendingSyncCount();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to clear sync flags:', error);
    }
  }

  // Stop background sync
  async stopBackgroundSync() {
    try {
      await BackgroundFetch.unregisterTaskAsync(this.backgroundTaskName);
    } catch (error) {
      console.error('Failed to stop background sync:', error);
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();
