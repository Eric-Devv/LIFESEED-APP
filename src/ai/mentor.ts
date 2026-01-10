import OpenAI from 'openai';
import Constants from 'expo-constants';
import { databaseService, Mood, Journal, Goal } from '../database/db';

// Support both OpenAI and Gemini
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.GEMINI_API_KEY;

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export interface Insight {
  id?: number;
  type: 'trend' | 'recommendation' | 'pattern' | 'achievement';
  title: string;
  description: string;
  data?: any; // Additional structured data
  createdAt: string;
  confidence?: number; // 0-1 confidence score
}

export interface UserDataContext {
  moods: Mood[];
  journals: Journal[];
  goals: Goal[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Fetches last 7 days of user data from SQLite
 */
export const fetchUserData = async (): Promise<UserDataContext> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch moods from last 7 days
    const allMoods = await databaseService.getMoods();
    const moods = allMoods.filter(
      (mood) => mood.date >= startDateStr && mood.date <= endDateStr
    );

    // Fetch journal entries from last 7 days
    const allJournals = await databaseService.getJournalEntries();
    const journals = allJournals.filter(
      (journal) => journal.date >= startDateStr && journal.date <= endDateStr
    );

    // Fetch all goals (not time-limited, but include progress)
    const goals = await databaseService.getGoals();

    return {
      moods,
      journals,
      goals,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      moods: [],
      journals: [],
      goals: [],
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    };
  }
};

/**
 * Formats user data into a context string for AI
 */
const formatUserDataContext = (userData: UserDataContext): string => {
  const { moods, journals, goals } = userData;

  // Analyze mood patterns
  const moodSummary = moods.length > 0
    ? `Moods (${moods.length} entries):\n${moods
        .map(
          (m) =>
            `- ${m.date}: ${m.emotion} (intensity: ${m.intensity}/10)${m.note ? ` - ${m.note}` : ''}`
        )
        .join('\n')}`
    : 'No mood entries in the last 7 days.';

  // Analyze journal patterns
  const journalSummary = journals.length > 0
    ? `Journal Entries (${journals.length} entries):\n${journals
        .map(
          (j, idx) =>
            `- Entry ${idx + 1} (${j.date}): Mood: ${j.mood || 'N/A'}\n  "${j.entry.substring(0, 200)}${j.entry.length > 200 ? '...' : ''}"`
        )
        .join('\n\n')}`
    : 'No journal entries in the last 7 days.';

  // Analyze goals
  const goalSummary = goals.length > 0
    ? `Goals (${goals.length} total):\n${goals
        .map(
          (g) =>
            `- "${g.title}": ${g.progress}% complete, ${g.completed ? 'COMPLETED' : 'in progress'}`
        )
        .join('\n')}`
    : 'No goals set.';

  // Calculate statistics
  const avgMoodIntensity =
    moods.length > 0
      ? (moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length).toFixed(1)
      : 'N/A';

  const mostCommonEmotion =
    moods.length > 0
      ? Object.entries(
          moods.reduce((acc, m) => {
            acc[m.emotion] = (acc[m.emotion] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      : 'N/A';

  const completedGoals = goals.filter((g) => g.completed).length;
  const inProgressGoals = goals.filter((g) => !g.completed && g.progress > 0).length;

  return `User Data Analysis Context (Last 7 Days):

STATISTICS:
- Average Mood Intensity: ${avgMoodIntensity}/10
- Most Common Emotion: ${mostCommonEmotion}
- Total Goals: ${goals.length} (${completedGoals} completed, ${inProgressGoals} in progress)
- Journal Entries: ${journals.length}
- Mood Entries: ${moods.length}

${moodSummary}

${journalSummary}

${goalSummary}

Please analyze this data and provide personalized insights and recommendations.`;
};

/**
 * Generates insights using OpenAI or Gemini API
 */
export const generateInsights = async (userData?: UserDataContext): Promise<Insight[]> => {
  try {
    // Fetch user data if not provided
    const data = userData || (await fetchUserData());
    const context = formatUserDataContext(data);

    // Try OpenAI first, then Gemini
    let insights: Insight[] = [];

    if (openai) {
      insights = await generateInsightsWithOpenAI(context, data);
    } else if (GEMINI_API_KEY) {
      insights = await generateInsightsWithGemini(context, data);
    } else {
      throw new Error('No AI API key configured. Please set OPENAI_API_KEY or GEMINI_API_KEY.');
    }

    // Cache insights in database
    if (insights.length > 0) {
      await cacheInsights(insights);
    }

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    // Return fallback insights
    return getFallbackInsights();
  }
};

/**
 * Generate insights using OpenAI
 */
const generateInsightsWithOpenAI = async (
  context: string,
  userData: UserDataContext
): Promise<Insight[]> => {
  if (!openai) throw new Error('OpenAI not configured');

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a personal growth mentor and life coach AI. Analyze user data and provide personalized, actionable insights. 
        
Your insights should:
1. Identify patterns and trends in mood, journal entries, and goals
2. Provide specific, actionable recommendations
3. Celebrate achievements and progress
4. Be encouraging and supportive
5. Reference specific data points when possible

Return insights in JSON format as an array of objects with:
- type: "trend" | "recommendation" | "pattern" | "achievement"
- title: A short, catchy title (max 60 chars)
- description: A detailed explanation (2-3 sentences)
- confidence: A number between 0 and 1 indicating confidence

Example:
[
  {
    "type": "pattern",
    "title": "Happiest when journaling early",
    "description": "Your mood entries show higher intensity (8-9/10) on days when you journal before 10 AM. Consider making morning journaling a habit.",
    "confidence": 0.85
  }
]`,
      },
      {
        role: 'user',
        content: context,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  try {
    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);
    const insightsArray = parsed.insights || parsed;

    return Array.isArray(insightsArray)
      ? insightsArray.map((insight: any) => ({
          type: insight.type || 'recommendation',
          title: insight.title || 'Insight',
          description: insight.description || '',
          confidence: insight.confidence || 0.7,
          createdAt: new Date().toISOString(),
        }))
      : [];
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    return getFallbackInsights();
  }
};

/**
 * Generate insights using Gemini API
 */
const generateInsightsWithGemini = async (
  context: string,
  userData: UserDataContext
): Promise<Insight[]> => {
  if (!GEMINI_API_KEY) throw new Error('Gemini not configured');

  try {
    // Using fetch for Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a personal growth mentor. Analyze this user data and provide insights in JSON format:

${context}

Return a JSON object with an "insights" array. Each insight should have:
- type: "trend" | "recommendation" | "pattern" | "achievement"
- title: Short title (max 60 chars)
- description: Detailed explanation (2-3 sentences)
- confidence: Number 0-1

Format: {"insights": [...]}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    
    const parsed = JSON.parse(jsonText);
    const insightsArray = parsed.insights || parsed;

    return Array.isArray(insightsArray)
      ? insightsArray.map((insight: any) => ({
          type: insight.type || 'recommendation',
          title: insight.title || 'Insight',
          description: insight.description || '',
          confidence: insight.confidence || 0.7,
          createdAt: new Date().toISOString(),
        }))
      : [];
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return getFallbackInsights();
  }
};

/**
 * Cache insights in SQLite database
 */
const cacheInsights = async (insights: Insight[]): Promise<void> => {
  try {
    for (const insight of insights) {
      await databaseService.insertInsight({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        data: JSON.stringify(insight.data || {}),
        confidence: insight.confidence || 0.7,
        createdAt: insight.createdAt || new Date().toISOString(),
        needsSync: true,
        lastModified: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error caching insights:', error);
  }
};

/**
 * Fallback insights when AI is unavailable
 */
const getFallbackInsights = (): Insight[] => {
  return [
    {
      type: 'recommendation',
      title: 'Keep Tracking Your Progress',
      description: 'Continue logging your moods and journal entries to unlock personalized insights.',
      confidence: 0.5,
      createdAt: new Date().toISOString(),
    },
  ];
};

/**
 * Chat with AI mentor about life questions
 */
export const chatWithMentor = async (
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    // Fetch user data for context
    const userData = await fetchUserData();
    const context = formatUserDataContext(userData);

    // Build conversation history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `You are a compassionate and wise personal growth mentor. You have access to the user's recent data (last 7 days of moods, journal entries, and goals). Use this context to provide personalized, empathetic advice. Be encouraging, practical, and supportive.`,
      },
      {
        role: 'user',
        content: `Here is my recent data for context:\n\n${context}\n\nNow, here is my question: ${message}`,
      },
    ];

    // Add conversation history
    conversationHistory.slice(-5).forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });

    if (openai) {
      return await chatWithOpenAI(messages);
    } else if (GEMINI_API_KEY) {
      return await chatWithGemini(message, context, conversationHistory);
    } else {
      throw new Error('No AI API key configured');
    }
  } catch (error) {
    console.error('Error chatting with mentor:', error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

/**
 * Chat with OpenAI
 */
const chatWithOpenAI = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> => {
  if (!openai) throw new Error('OpenAI not configured');

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages as any,
    temperature: 0.8,
  });

  return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
};

/**
 * Chat with Gemini
 */
const chatWithGemini = async (
  message: string,
  context: string,
  conversationHistory: ChatMessage[]
): Promise<string> => {
  if (!GEMINI_API_KEY) throw new Error('Gemini not configured');

  const conversationText = conversationHistory
    .slice(-5)
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Mentor'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a personal growth mentor. Here is the user's recent data:

${context}

${conversationText ? `Previous conversation:\n${conversationText}\n\n` : ''}User: ${message}\nMentor:`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";
};
