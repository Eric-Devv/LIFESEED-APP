import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Chip,
  FAB,
  ActivityIndicator,
  Paragraph,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../hooks/useDatabase';
import { generateInsights, Insight } from '../ai/mentor';

interface InsightsScreenProps {
  navigation: any;
}

const screenWidth = Dimensions.get('window').width;

const InsightsScreen: React.FC<InsightsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { getInsights, getMoods, getJournalEntries, getGoals } = useDatabase();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const cachedInsights = await getInsights();
      // Sort by creation date, newest first
      const sorted = cachedInsights.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInsights(sorted);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const newInsights = await generateInsights();
      if (newInsights.length > 0) {
        setInsights((prev) => [...newInsights, ...prev]);
        Alert.alert('Success', `Generated ${newInsights.length} new insights!`);
      } else {
        Alert.alert('Info', 'No new insights generated. Try again later.');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      Alert.alert('Error', 'Failed to generate insights. Please check your API key configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInsights();
    setIsRefreshing(false);
  };

  const getInsightsByType = (type: string) => {
    return insights.filter((i) => i.type === type);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend':
        return '#2196F3';
      case 'recommendation':
        return '#4CAF50';
      case 'pattern':
        return '#FF9800';
      case 'achievement':
        return '#9C27B0';
      default:
        return theme.colors.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return 'trending-up';
      case 'recommendation':
        return 'lightbulb';
      case 'pattern':
        return 'chart-line';
      case 'achievement':
        return 'trophy';
      default:
        return 'information';
    }
  };

  // Prepare chart data for insights distribution
  const getInsightsDistribution = () => {
    const distribution = insights.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(distribution);
    const data = Object.values(distribution);
    const colors = labels.map((type) => getTypeColor(type));

    return { labels, data, colors };
  };

  // Prepare chart data for confidence levels
  const getConfidenceData = () => {
    const ranges = [
      { label: '0-0.5', count: 0 },
      { label: '0.5-0.7', count: 0 },
      { label: '0.7-0.9', count: 0 },
      { label: '0.9-1.0', count: 0 },
    ];

    insights.forEach((insight) => {
      const confidence = insight.confidence || 0.7;
      if (confidence < 0.5) ranges[0].count++;
      else if (confidence < 0.7) ranges[1].count++;
      else if (confidence < 0.9) ranges[2].count++;
      else ranges[3].count++;
    });

    return {
      labels: ranges.map((r) => r.label),
      datasets: [
        {
          data: ranges.map((r) => r.count),
        },
      ],
    };
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => theme.colors.text + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
  };

  const distribution = getInsightsDistribution();
  const confidenceData = getConfidenceData();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        <Title style={[styles.title, { color: theme.colors.text }]}>AI Insights</Title>

        {/* Stats Overview */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title>Insights Overview</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {insights.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Total Insights</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                  {getInsightsByType('recommendation').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Recommendations</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FF9800' }]}>
                  {getInsightsByType('pattern').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Patterns</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#2196F3' }]}>
                  {getInsightsByType('trend').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Trends</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Charts */}
        {insights.length > 0 && (
          <>
            {/* Insights Distribution Chart */}
            {distribution.labels.length > 0 && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Title>Insights by Type</Title>
                  <PieChart
                    data={distribution.labels.map((label, index) => ({
                      name: label,
                      population: distribution.data[index],
                      color: distribution.colors[index],
                      legendFontColor: theme.colors.text,
                      legendFontSize: 12,
                    }))}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    style={styles.chart}
                  />
                </Card.Content>
              </Card>
            )}

            {/* Confidence Levels Chart */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Title>Confidence Levels</Title>
                <BarChart
                  data={confidenceData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  verticalLabelRotation={0}
                  style={styles.chart}
                  showValuesOnTopOfBars
                />
              </Card.Content>
            </Card>
          </>
        )}

        {/* Insights List */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title>Your Insights</Title>
              <Button
                mode="outlined"
                onPress={handleGenerateInsights}
                disabled={isGenerating}
                loading={isGenerating}
                compact
              >
                Generate New
              </Button>
            </View>

            {insights.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Paragraph style={[styles.emptyText, { color: theme.colors.text }]}>
                  No insights yet. Generate insights to discover patterns in your data!
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={handleGenerateInsights}
                  disabled={isGenerating}
                  loading={isGenerating}
                  style={styles.generateButton}
                >
                  Generate Insights
                </Button>
              </View>
            ) : (
              insights.map((insight) => (
                <Card
                  key={insight.id}
                  style={[styles.insightCard, { backgroundColor: theme.colors.background }]}
                >
                  <Card.Content>
                    <View style={styles.insightHeader}>
                      <View style={styles.insightTitleRow}>
                        <IconButton
                          icon={getTypeIcon(insight.type)}
                          size={20}
                          iconColor={getTypeColor(insight.type)}
                        />
                        <View style={styles.insightTitleContainer}>
                          <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
                            {insight.title}
                          </Text>
                          <Chip
                            style={[styles.typeChip, { backgroundColor: getTypeColor(insight.type) + '20' }]}
                            textStyle={{ color: getTypeColor(insight.type), fontSize: 10 }}
                            compact
                          >
                            {insight.type}
                          </Chip>
                        </View>
                      </View>
                    </View>

                    <Paragraph style={[styles.insightDescription, { color: theme.colors.text }]}>
                      {insight.description}
                    </Paragraph>

                    {insight.confidence !== undefined && (
                      <View style={styles.confidenceContainer}>
                        <Text style={[styles.confidenceLabel, { color: theme.colors.text }]}>
                          Confidence: {(insight.confidence * 100).toFixed(0)}%
                        </Text>
                        <ProgressBar
                          progress={insight.confidence}
                          color={getTypeColor(insight.type)}
                          style={styles.confidenceBar}
                        />
                      </View>
                    )}

                    <Text style={[styles.insightDate, { color: theme.colors.text }]}>
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="refresh"
        onPress={handleGenerateInsights}
        loading={isGenerating}
        disabled={isGenerating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  generateButton: {
    marginTop: 8,
  },
  insightCard: {
    marginBottom: 12,
    elevation: 2,
  },
  insightHeader: {
    marginBottom: 8,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  typeChip: {
    marginLeft: 8,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    opacity: 0.9,
  },
  confidenceContainer: {
    marginTop: 12,
  },
  confidenceLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
  },
  insightDate: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default InsightsScreen;
