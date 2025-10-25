import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Button, 
  List, 
  Switch,
  Divider,
  ActivityIndicator,
  Paragraph
} from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { syncService, SyncStatus } from '../services/syncService';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, userProfile } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSync: null,
    pendingSync: 0,
    isSyncing: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    // Initialize sync service
    syncService.initialize();

    // Listen to sync status changes
    const unsubscribe = syncService.addSyncListener((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleBackupNow = async () => {
    setIsLoading(true);
    try {
      const success = await syncService.backupNow();
      if (success) {
        Alert.alert('Success', 'Data backed up successfully!');
      } else {
        Alert.alert('Error', 'Failed to backup data. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Backup failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreData = async () => {
    Alert.alert(
      'Restore Data',
      'This will overwrite your local data with data from the cloud. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await syncService.restoreData();
              if (success) {
                Alert.alert('Success', 'Data restored successfully!');
              } else {
                Alert.alert('Error', 'Failed to restore data. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Restore failed. Please check your connection.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleForceSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncService.forceSync();
      Alert.alert(
        'Sync Complete',
        `Local wins: ${result.localWins}\nRemote wins: ${result.remoteWins}\nMerged: ${result.merged}`
      );
    } catch (error) {
      Alert.alert('Error', 'Sync failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSyncFlags = () => {
    Alert.alert(
      'Clear Sync Flags',
      'This will mark all records as synced. Use only if you\'re sure all data is up to date.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await syncService.clearSyncFlags();
            Alert.alert('Success', 'Sync flags cleared.');
          },
        },
      ]
    );
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    return date.toLocaleString();
  };

  const getSyncStatusColor = () => {
    if (syncStatus.isSyncing) return theme.colors.primary;
    if (syncStatus.pendingSync > 0) return theme.colors.accent;
    if (syncStatus.isOnline) return '#4CAF50';
    return '#F44336';
  };

  const getSyncStatusText = () => {
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.pendingSync > 0) return `${syncStatus.pendingSync} pending`;
    if (syncStatus.isOnline) return 'Online';
    return 'Offline';
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Title style={[styles.title, { color: theme.colors.text }]}>
        Settings
      </Title>

      {/* User Info */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Account</Title>
          <List.Item
            title={userProfile?.name || 'User'}
            description={userProfile?.email || user?.email}
            left={props => <List.Icon {...props} icon="account" />}
          />
        </Card.Content>
      </Card>

      {/* Sync Status */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Sync Status</Title>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
              Status:
            </Text>
            <View style={styles.statusIndicator}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getSyncStatusColor() }
                ]} 
              />
              <Text style={[styles.statusText, { color: getSyncStatusColor() }]}>
                {getSyncStatusText()}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
              Last Sync:
            </Text>
            <Text style={[styles.statusValue, { color: theme.colors.text }]}>
              {formatLastSync(syncStatus.lastSync)}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
              Pending:
            </Text>
            <Text style={[styles.statusValue, { color: theme.colors.text }]}>
              {syncStatus.pendingSync} records
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Sync Controls */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Data Sync</Title>
          
          <List.Item
            title="Auto Sync"
            description="Automatically sync data when online"
            left={props => <List.Icon {...props} icon="sync" />}
            right={() => (
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                color={theme.colors.primary}
              />
            )}
          />

          <Divider style={styles.divider} />

          <Button
            mode="contained"
            onPress={handleBackupNow}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            disabled={isLoading || !syncStatus.isOnline}
            icon="cloud-upload"
          >
            {isLoading ? 'Backing Up...' : 'Back Up Now'}
          </Button>

          <Button
            mode="outlined"
            onPress={handleRestoreData}
            style={styles.button}
            disabled={isLoading || !syncStatus.isOnline}
            icon="cloud-download"
          >
            Restore Data
          </Button>

          <Button
            mode="outlined"
            onPress={handleForceSync}
            style={styles.button}
            disabled={isLoading || !syncStatus.isOnline}
            icon="sync"
          >
            Force Sync
          </Button>

          <Button
            mode="text"
            onPress={handleClearSyncFlags}
            style={styles.button}
            textColor={theme.colors.error || '#F44336'}
            icon="flag-off"
          >
            Clear Sync Flags
          </Button>
        </Card.Content>
      </Card>

      {/* Sync Information */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Sync Information</Title>
          <Paragraph style={[styles.infoText, { color: theme.colors.text }]}>
            • Data is automatically synced when you're online
          </Paragraph>
          <Paragraph style={[styles.infoText, { color: theme.colors.text }]}>
            • Changes are synced every 30 minutes in the background
          </Paragraph>
          <Paragraph style={[styles.infoText, { color: theme.colors.text }]}>
            • Latest changes take priority in case of conflicts
          </Paragraph>
          <Paragraph style={[styles.infoText, { color: theme.colors.text }]}>
            • All data is stored securely in Firebase
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Processing...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  button: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default SettingsScreen;
