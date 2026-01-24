import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB, Appbar, Surface } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { scale, moderateScale, getPadding } from '../utils/responsive';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { userProfile } = useUser();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const cardAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

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

    Animated.stagger(
      100,
      cardAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const renderFeatureCard = (
    title: string,
    description: string,
    icon: string,
    screen: string,
    index: number
  ) => {
    const scaleValue = cardAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    });

    return (
      <Animated.View
        key={title}
        style={{
          opacity: cardAnimations[index],
          transform: [{ scale: scaleValue }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate(screen)}
        >
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.colors.primary + '20' },
                ]}
              >
                <Text style={styles.icon}>{icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  {title}
                </Text>
                <Text
                  style={[
                    styles.cardText,
                    { color: theme.colors.text, opacity: 0.75 },
                  ]}
                >
                  {description}
                </Text>
              </View>

              <View
                style={[
                  styles.arrow,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.arrowText}>→</Text>
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Lifeseed" titleStyle={{ fontWeight: 'bold' }} />
        <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: getPadding(), paddingBottom: scale(96) }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginBottom: scale(24),
          }}
        >
          <Text
            style={[
              styles.title,
              { color: theme.colors.text },
            ]}
          >
            Welcome back,{'\n'}
            <Text style={{ color: theme.colors.primary }}>
              {userProfile?.name || 'User'}!
            </Text>
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.text, opacity: 0.7 },
            ]}
          >
            Ready to continue your growth journey?
          </Text>
        </Animated.View>

        {renderFeatureCard(
          "Today's Reflection",
          'Reflect on your day and track growth',
          '📝',
          'Journal',
          0
        )}
        {renderFeatureCard(
          'Mood Tracker',
          'Track emotions and patterns',
          '😊',
          'MoodTracker',
          1
        )}
        {renderFeatureCard(
          'Your Goals',
          'Set milestones and measure progress',
          '🎯',
          'GoalTracker',
          2
        )}
        {renderFeatureCard(
          'Habit Builder',
          'Build habits and track streaks',
          '🔥',
          'Habits',
          3
        )}
        {renderFeatureCard(
          'AI Insights',
          'Personalized insights and trends',
          '✨',
          'Insights',
          4
        )}
        {renderFeatureCard(
          'AI Mentor',
          'Chat with your AI mentor',
          '🤖',
          'AIMentor',
          5
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  title: {
    fontSize: moderateScale(30),
    fontWeight: '700',
    lineHeight: scale(40),
    marginBottom: scale(8),
  },

  subtitle: {
    fontSize: moderateScale(16),
  },

  card: {
    borderRadius: scale(20),
    marginBottom: scale(16),
    elevation: 4,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(20),
  },

  iconCircle: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },

  icon: {
    fontSize: scale(28),
  },

  textContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    marginBottom: scale(4),
  },

  cardText: {
    fontSize: moderateScale(14),
  },

  arrow: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrowText: {
    color: '#fff',
    fontSize: scale(18),
    fontWeight: 'bold',
  },

  fab: {
    position: 'absolute',
    right: scale(16),
    bottom: scale(16),
    borderRadius: scale(28),
  },
});

export default HomeScreen;
