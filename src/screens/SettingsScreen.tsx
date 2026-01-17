import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput as RNTextInput } from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  List,
  Switch,
  Divider,
  ActivityIndicator,
  Paragraph,
  TextInput,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { syncService, SyncStatus } from '../services/syncService';
import NetInfo from '@react-native-community/netinfo';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, userProfile, updateProfile, deleteAccount } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSync: null,
    pendingSync: 0,
    isSyncing: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  useEffect(() => {
    // Initialize sync service
    syncService.initialize();

    // Listen to sync status changes
    const unsubscribeSync = syncService.addSyncListener((status) => {
      setSyncStatus(status);
    });

    // Listen to network connectivity changes
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      if (isConnected && autoSync && !syncStatus.isSyncing) {
        // Auto-sync when coming online
        syncService.syncData().catch((error) => {
          console.error('Auto-sync failed:', error);
        });
      }
    });

    // Initial network check
    NetInfo.fetch().then((state) => {
      const isConnected = state.isConnected ?? false;
      if (isConnected && autoSync) {
        syncService.syncData().catch((error) => {
          console.error('Initial auto-sync failed:', error);
        });
      }
    });

    return () => {
      unsubscribeSync();
      unsubscribeNetInfo();
    };
  }, [autoSync]);

  const handleBackupNow = async () => {
    setIsLoading(true);
    try {
      const success = await syncService.pushToFirebase();
      if (success) {
        Alert.alert('Success', 'Data backed up successfully to Firebase!');
      } else {
        Alert.alert('Error', 'Failed to backup data. Please try again.');
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Error', 'Backup failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreData = async () => {
    Alert.alert(
      'Restore Data',
      'This will overwrite your local data with data from Firebase. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await syncService.pullFromFirebase();
              if (success) {
                Alert.alert('Success', 'Data restored successfully from Firebase!');
              } else {
                Alert.alert('Error', 'Failed to restore data. Please try again.');
              }
            } catch (error) {
              console.error('Restore error:', error);
              Alert.alert('Error', 'Restore failed. Please check your connection.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleManageAccount = () => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditEmail(userProfile.email);
      setShowAccountDialog(true);
    }
  };

  const handleSaveAccount = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!editEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSavingAccount(true);
    try {
      await updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });
      setShowAccountDialog(false);
      Alert.alert('Success', 'Account updated successfully!');
    } catch (error) {
      console.error('Update account error:', error);
      Alert.alert('Error', 'Failed to update account. Please try again.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Success', 'Account deleted successfully');
              // Navigation will be handled by auth state change
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
      <Title style={[styles.title, { color: theme.colors.text }]}>Settings</Title>

      {/* Account Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Account</Title>
          <List.Item
            title={userProfile?.name || 'User'}
            description={userProfile?.email || user?.email}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => (
              <Button mode="text" onPress={handleManageAccount} textColor={theme.colors.primary}>
                Manage
              </Button>
            )}
          />
        </Card.Content>
      </Card>

      {/* Theme Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Appearance</Title>
          <List.Item
            title="Dark Mode"
            description={isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            left={(props) => <List.Icon {...props} icon={isDark ? 'weather-night' : 'weather-sunny'} />}
            right={() => (
              <Switch value={isDark} onValueChange={toggleTheme} color={theme.colors.primary} />
            )}
          />
        </Card.Content>
      </Card>

      {/* Sync Status */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title>Sync Status</Title>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Status:</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: getSyncStatusColor() }]} />
              <Text style={[styles.statusText, { color: getSyncStatusColor() }]}>
                {getSyncStatusText()}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Last Backup:</Text>
            <Text style={[styles.statusValue, { color: theme.colors.text }]}>
              {formatLastSync(syncStatus.lastSync)}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Pending:</Text>
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
            left={(props) => <List.Icon {...props} icon="sync" />}
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
            loading={isLoading}
          >
            Back Up Now
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
        </Card.Content>
      </Card>

      {/* Danger Zone */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={{ color: '#F44336' }}>Danger Zone</Title>
          <Button
            mode="contained"
            onPress={handleDeleteAccount}
            style={[styles.button, { backgroundColor: '#F44336' }]}
            icon="delete"
          >
            Delete Account
          </Button>
        </Card.Content>
      </Card>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Processing...</Text>
        </View>
      )}

      {/* Account Management Dialog */}
      <Portal>
        <Dialog visible={showAccountDialog} onDismiss={() => setShowAccountDialog(false)}>
          <Dialog.Title>Manage Account</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              style={styles.dialogInput}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                },
              }}
            />
            <TextInput
              label="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.dialogInput}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                },
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAccountDialog(false)}>Cancel</Button>
            <Button
              onPress={handleSaveAccount}
              mode="contained"
              loading={isSavingAccount}
              disabled={isSavingAccount}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  dialogInput: {
    marginBottom: 16,
  },
});

export default SettingsScreen;
