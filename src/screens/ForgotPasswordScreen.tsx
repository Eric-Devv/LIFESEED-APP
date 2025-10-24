import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { resetPassword } = useUser();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'Please check your email for password reset instructions.'
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = 'An error occurred while sending the reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Sending reset email..." />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.text }]}>
          Reset Password
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.text }]}>
          {emailSent 
            ? 'Check your email for reset instructions'
            : 'Enter your email address and we\'ll send you a link to reset your password'
          }
        </Paragraph>
      </View>

      {!emailSent ? (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                },
              }}
            />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
              disabled={isLoading}
            >
              Send Reset Email
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.successContent}>
            <Text style={[styles.successText, { color: theme.colors.primary }]}>
              ✓ Reset email sent successfully!
            </Text>
            <Paragraph style={[styles.instructions, { color: theme.colors.text }]}>
              Please check your email and follow the instructions to reset your password.
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      <View style={styles.footer}>
        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          textColor={theme.colors.primary}
          style={styles.linkButton}
        >
          Back to Sign In
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    elevation: 4,
    marginBottom: 24,
  },
  form: {
    padding: 16,
  },
  successContent: {
    padding: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructions: {
    textAlign: 'center',
    opacity: 0.8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
  },
});

export default ForgotPasswordScreen;
