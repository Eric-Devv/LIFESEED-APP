# Lifeseed Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` with your actual API keys:
   - Firebase configuration
   - OpenAI API key

3. **Start Development Server**
   ```bash
   npm start
   ```

## Environment Setup

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication and Firestore
4. Get your web app configuration
5. Add the configuration to your `.env` file

### OpenAI Setup
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add it to your `.env` file

## Testing the App

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Running on Devices
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Project Structure

The app is organized with the following structure:

- `src/components/` - Reusable UI components
- `src/screens/` - Screen components
- `src/hooks/` - Custom React hooks
- `src/context/` - React Context providers
- `src/database/` - SQLite database operations
- `src/firebase/` - Firebase configuration
- `src/ai/` - AI analysis services
- `src/utils/` - Utility functions
- `src/services/` - Business logic services
- `src/assets/` - Static assets

## Features Implemented

✅ **Project Structure** - Complete folder structure with TypeScript
✅ **Dependencies** - All required packages configured
✅ **Database** - SQLite schema and operations
✅ **Firebase** - Authentication and Firestore setup
✅ **AI Integration** - OpenAI API integration
✅ **Theme System** - Dark/light mode support
✅ **Notifications** - Expo notifications setup
✅ **Code Quality** - ESLint and Prettier configured
✅ **Navigation** - React Navigation ready
✅ **UI Components** - React Native Paper setup

## Next Steps

1. Add your Firebase and OpenAI API keys to `.env`
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server
4. Test on your preferred platform (Android/iOS/Web)

The app is ready for development! 🚀

