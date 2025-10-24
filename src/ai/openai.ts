import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  mood: number;
  insights: string[];
  recommendations: string[];
}

export const analyzeJournalEntry = async (content: string): Promise<AIAnalysis> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a mental health and personal growth AI assistant. Analyze journal entries for sentiment, mood, and provide insights and recommendations.',
        },
        {
          role: 'user',
          content: `Analyze this journal entry and provide sentiment analysis, mood score (1-10), insights, and recommendations: ${content}`,
        },
      ],
      temperature: 0.7,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      sentiment: analysis.sentiment || 'neutral',
      mood: analysis.mood || 5,
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || [],
    };
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    return {
      sentiment: 'neutral',
      mood: 5,
      insights: ['Unable to analyze entry at this time'],
      recommendations: ['Try again later'],
    };
  }
};

export const generateGoalSuggestions = async (userGoals: string[]): Promise<string[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a personal development coach. Suggest relevant goals based on user history.',
        },
        {
          role: 'user',
          content: `Based on these existing goals: ${userGoals.join(', ')}, suggest 3-5 new relevant goals for personal growth.`,
        },
      ],
      temperature: 0.8,
    });

    return response.choices[0].message.content?.split('\n').filter(goal => goal.trim()) || [];
  } catch (error) {
    console.error('Error generating goal suggestions:', error);
    return ['Focus on daily habits', 'Practice mindfulness', 'Set weekly challenges'];
  }
};

