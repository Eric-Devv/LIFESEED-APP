import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Text, Card, Button, FAB, Appbar, Surface } from 'react-native-paper';
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

  const cardAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = cardAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  }, []);

  const renderFeatureCard = (
    title: string,
    description: string,
    icon: string,
    screen: string,
    index: number,
    isPrimary: boolean = false
  ) => {
    const cardAnim = cardAnimations[index];
    const scaleValue = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    });
    const opacityValue = cardAnim;

    return (
      <Animated.View
        style={{
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate(screen)}
        >
          <Surface
            style={[
              styles.modernCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: scale(20),
                elevation: 4,
                marginBottom: scale(16),
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.iconEmoji, { fontSize: scale(32) }]}>{icon}</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text
                  style={[
                    styles.modernCardTitle,
                    { color: theme.colors.text, fontSize: moderateScale(18, 0.3) },
                  ]}
                >
                  {title}
                </Text>
                <Text
                  style={[
                    styles.modernCardText,
                    {
                      color: theme.colors.text,
                      fontSize: moderateScale(14, 0.3),
                      opacity: 0.8,
                    },
                  ]}
                >
                  {description}
                </Text>
              </View>
              <View style={[styles.arrowContainer, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header
        style={{
          backgroundColor: theme.colors.surface,
          elevation: 0,
        }}
      >
        <Appbar.Content title="Lifeseed" titleStyle={{ fontWeight: 'bold' }} />
        <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings')} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={[styles.content, { padding: getPadding() }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text
            style={[
              styles.modernTitle,
              {
                color: theme.colors.text,
                fontSize: moderateScale(32, 0.3),
                marginBottom: scale(8),
              },
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
              {
                color: theme.colors.text,
                fontSize: moderateScale(16, 0.3),
                opacity: 0.7,
                marginBottom: scale(24),
              },
            ]}
          >
            Ready to continue your growth journey?
          </Text>
        </Animated.View>

        {renderFeatureCard(
          "Today's Reflection",
          'Take a moment to reflect on your day and track your growth',
          '📝',
          'Journal',
          0,
          true
        )}

        {renderFeatureCard(
          'Mood Tracker',
          'Track your emotions and see patterns over time',
          '😊',
          'MoodTracker',
          1
        )}

        {renderFeatureCard(
          'Your Goals',
          'Track your progress and set new milestones',
          '🎯',
          'GoalTracker',
          2
        )}

        {renderFeatureCard(
          'Habit Builder',
          'Build positive habits and track your streaks',
          '🔥',
          'Habits',
          3
        )}

        {renderFeatureCard(
          'AI Insights',
          'Discover patterns and get personalized recommendations',
          '✨',
          'Insights',
          4
        )}

        {renderFeatureCard(
          'AI Mentor',
          'Chat with your AI mentor for personalized life advice',
          '🤖',
          'AIMentor',
          5
        )}
      </ScrollView>
    </View>
  );
};

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Mood Tracker
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Track your emotions and see patterns over time.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('MoodTracker')}
            >
              Track Mood
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Your Goals
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Track your progress and set new milestones.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('GoalTracker')}
            >
              View Goals
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Habit Builder
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Build positive habits and track your streaks.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('Habits')}
            >
              Manage Habits
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              AI Insights
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Discover patterns and get personalized recommendations from AI.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('Insights')}
            >
              View Insights
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              AI Mentor
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Chat with your AI mentor for personalized life advice.
            </Text>
            <Button 
              mode="outlined" 
              style={styles.button}
              onPress={() => navigation.navigate('AIMentor')}
            >
              Chat with Mentor
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: scale(80),
  },
  headerContainer: {
    marginBottom: scale(24),
  },
  modernTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: scale(40),
  },
  subtitle: {
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  modernCard: {
    borderRadius: scale(20),
    overflow: 'hidden',
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
  iconEmoji: {
    fontSize: scale(28),
  },
  cardTextContainer: {
    flex: 1,
  },
  modernCardTitle: {
    fontWeight: '600',
    marginBottom: scale(4),
    letterSpacing: 0.3,
  },
  modernCardText: {
    lineHeight: scale(20),
    letterSpacing: 0.2,
  },
  arrowContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: scale(16),
    right: 0,
    bottom: 0,
    borderRadius: scale(28),
  },
});

export default HomeScreen;

