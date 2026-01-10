import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Avatar,
  ActivityIndicator,
  FAB,
  IconButton,
} from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { chatWithMentor, ChatMessage } from '../ai/mentor';

interface AIMentorChatProps {
  navigation: any;
}

const AIMentorChat: React.FC<AIMentorChatProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI mentor. I have access to your recent mood, journal, and goal data. How can I help you today? Feel free to ask me anything about your personal growth, habits, or life in general!",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get response from AI mentor
      const response = await chatWithMentor(userMessage.content, messages);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error chatting with mentor:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please check your API key configuration and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      Alert.alert('Error', 'Failed to get response from AI mentor. Please check your API key configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                role: 'assistant',
                content: "Chat cleared! How can I help you today?",
                timestamp: new Date().toISOString(),
              },
            ]);
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    "How can I improve my mood?",
    "What patterns do you see in my data?",
    "Help me set better goals",
    "How can I build better habits?",
    "What should I focus on this week?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Title style={[styles.headerTitle, { color: theme.colors.text }]}>AI Mentor</Title>
        <IconButton
          icon="delete-outline"
          size={24}
          onPress={handleClearChat}
          iconColor={theme.colors.text}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <Card style={[styles.suggestionsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.suggestionsTitle, { color: theme.colors.text }]}>
                Suggested Questions:
              </Text>
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  mode="outlined"
                  onPress={() => handleSuggestedQuestion(question)}
                  style={styles.suggestionButton}
                  compact
                >
                  {question}
                </Button>
              ))}
            </Card.Content>
          </Card>
        )}

        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer,
            ]}
          >
            {message.role === 'assistant' && (
              <Avatar.Icon
                size={32}
                icon="robot"
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
              />
            )}
            <Card
              style={[
                styles.messageCard,
                message.role === 'user'
                  ? [styles.userMessage, { backgroundColor: theme.colors.primary }]
                  : [styles.assistantMessage, { backgroundColor: theme.colors.surface }],
              ]}
            >
              <Card.Content style={styles.messageContent}>
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' ? styles.userMessageText : { color: theme.colors.text },
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.role === 'user' ? styles.userMessageTime : { color: theme.colors.text },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </Card.Content>
            </Card>
            {message.role === 'user' && (
              <Avatar.Icon
                size={32}
                icon="account"
                style={[styles.avatar, { backgroundColor: theme.colors.accent }]}
              />
            )}
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about your personal growth..."
          placeholderTextColor={theme.colors.text + '80'}
          multiline
          maxLength={500}
          disabled={isLoading}
          theme={{
            colors: {
              primary: theme.colors.primary,
              text: theme.colors.text,
            },
          }}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          iconColor={theme.colors.primary}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80,
  },
  suggestionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  suggestionButton: {
    marginBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
  },
  messageCard: {
    maxWidth: '75%',
    elevation: 2,
  },
  userMessage: {
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    borderTopLeftRadius: 4,
  },
  messageContent: {
    padding: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },
  userMessageTime: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    marginRight: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButton: {
    margin: 0,
  },
});

export default AIMentorChat;
