# Lifeseed

A React Native Expo app for personal growth tracking, journaling, and AI-powered insights.

## Features

- 📝 **Journaling**: Track daily thoughts and experiences
- 🎯 **Goal Setting**: Set and track personal development goals
- 🤖 **AI Analysis**: Get insights from your journal entries using OpenAI
- 🔐 **Authentication**: Secure user authentication with Firebase
- 💾 **Local Storage**: SQLite database for offline functionality
- 🔄 **Sync**: Firebase Firestore for cloud backup
- 🌙 **Dark Mode**: Theme support with automatic dark/light mode
- 🔔 **Notifications**: Reminders for journaling and goal tracking
- 📱 **Cross Platform**: Works on both Android and iOS

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase** for authentication and cloud storage
- **SQLite** for local database
- **OpenAI API** for AI analysis
- **React Native Paper** for UI components
- **React Navigation** for navigation
- **Expo Notifications** for reminders

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Lifeseed
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Configure your environment variables in `.env`:
   - Add your Firebase configuration
   - Add your OpenAI API key

5. Start the development server:
```bash
npm start
```

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication and Firestore
3. Add your web app to the project
4. Copy the configuration to your `.env` file

### OpenAI Setup

1. Get an API key from OpenAI
2. Add it to your `.env` file

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # Screen components
├── hooks/         # Custom React hooks
├── context/       # React Context providers
├── database/      # SQLite database schema and operations
├── firebase/      # Firebase configuration and services
├── ai/           # AI analysis services
├── utils/        # Utility functions
├── services/     # Business logic services
└── assets/       # Images, fonts, and other assets
```

## Development

### Code Quality

The project uses ESLint and Prettier for code quality:

```bash
# Run ESLint
npm run lint

# Run Prettier
npm run format
```

### Building

```bash
# Build for development
npm run start

# Build for Android
npm run android

# Build for iOS
npm run ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Copyright 2025 ERIMTECH Solutions. All Rights Reserved.

This software is the private and proprietary property of ERIMTECH Solutions and is licensed to users under a separate End-User License Agreement (EULA).

Unauthorized reproduction, modification, distribution, or commercial use is strictly prohibited.

