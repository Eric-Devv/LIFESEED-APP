import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { Text, TextInput, Button, Card, Title, Paragraph, Surface } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { scale, moderateScale, getPadding } from '../utils/responsive';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { signIn, loading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { padding: getPadding() }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Title style={[styles.title, { color: theme.colors.text, fontSize: moderateScale(32, 0.3) }]}>
          Welcome Back
        </Title>
        <Paragraph style={[styles.subtitle, { color: theme.colors.text, fontSize: moderateScale(16, 0.3) }]}>
          Sign in to continue your growth journey
        </Paragraph>
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Surface style={[styles.modernCard, { backgroundColor: theme.colors.surface, borderRadius: scale(24) }]}>
          <View style={[styles.form, { padding: scale(24) }]}>
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

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            autoComplete="password"
            style={styles.input}
            theme={{
              colors: {
                primary: theme.colors.primary,
              },
            }}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            disabled={isLoading}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.linkButton}
            textColor={theme.colors.primary}
          >
            Forgot Password?
          </Button>
          </View>
        </Surface>
      </Animated.View>

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.footerText, { color: theme.colors.text }]}>
          Don't have an account?{' '}
        </Text>
        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          textColor={theme.colors.primary}
          style={styles.linkButton}
        >
          Sign Up
        </Button>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: scale(8),
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  modernCard: {
    elevation: 8,
    marginBottom: scale(24),
  },
  form: {
    // padding handled inline
  },
  input: {
    marginBottom: scale(16),
  },
  button: {
    marginTop: scale(8),
    marginBottom: scale(16),
    borderRadius: scale(28),
  },
  buttonContent: {
    paddingVertical: scale(8),
  },
  linkButton: {
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(16),
  },
  footerText: {
    fontSize: moderateScale(16, 0.3),
  },
});

export default LoginScreen;
