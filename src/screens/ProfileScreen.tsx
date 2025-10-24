import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar, 
  List, 
  Divider,
  Dialog,
  Portal
} from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, userProfile, signOut, deleteAccount, updateProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              // Navigation will be handled by auth state change
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => setShowDeleteDialog(true),
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      setShowDeleteDialog(false);
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <LoadingSpinner message="Processing..." />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={userProfile ? getInitials(userProfile.name) : 'U'}
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        />
        <Title style={[styles.name, { color: theme.colors.text }]}>
          {userProfile?.name || 'User'}
        </Title>
        <Paragraph style={[styles.email, { color: theme.colors.text }]}>
          {userProfile?.email || user?.email}
        </Paragraph>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account Information
          </Title>
          
          <List.Item
            title="Email"
            description={userProfile?.email || user?.email}
            left={props => <List.Icon {...props} icon="email" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Member Since"
            description={userProfile?.createdAt 
              ? new Date(userProfile.createdAt).toLocaleDateString()
              : 'Unknown'
            }
            left={props => <List.Icon {...props} icon="calendar" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account Actions
          </Title>
          
          <Button
            mode="outlined"
            onPress={handleSignOut}
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            textColor={theme.colors.primary}
            icon="logout"
          >
            Sign Out
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleDeleteAccount}
            style={[styles.actionButton, { borderColor: theme.colors.error || '#f44336' }]}
            textColor={theme.colors.error || '#f44336'}
            icon="delete"
          >
            Delete Account
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Confirm Account Deletion</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              This action cannot be undone. All your data including journal entries, 
              goals, and personal information will be permanently deleted.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onPress={confirmDeleteAccount}
              textColor={theme.colors.error || '#f44336'}
              disabled={isLoading}
            >
              Delete Forever
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    elevation: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
  actionButton: {
    marginBottom: 12,
    marginTop: 8,
  },
});

export default ProfileScreen;
