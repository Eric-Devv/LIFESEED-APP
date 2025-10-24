# Firebase Setup Guide for Lifeseed

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "Lifeseed" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 4. Get Web App Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`)
4. Enter app nickname: "Lifeseed Web"
5. Click "Register app"
6. Copy the configuration object

## 5. Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 6. Update app.json (Alternative Method)

You can also add Firebase config directly to `app.json`:

```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "your_api_key_here",
      "firebaseAuthDomain": "your_project_id.firebaseapp.com",
      "firebaseProjectId": "your_project_id",
      "firebaseStorageBucket": "your_project_id.appspot.com",
      "firebaseMessagingSenderId": "your_sender_id",
      "firebaseAppId": "your_app_id"
    }
  }
}
```

## 7. Security Rules (Firestore)

Update your Firestore security rules to allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own journal entries
    match /journal_entries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Users can read and write their own goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 8. Test Authentication

1. Run your app: `npm start`
2. Try registering a new account
3. Check Firebase Console > Authentication to see the new user
4. Check Firestore Database to see the user profile document

## 9. Production Considerations

### Security Rules
- Update Firestore rules for production
- Consider implementing additional validation
- Set up proper error handling

### Environment Variables
- Use different Firebase projects for development/production
- Never commit `.env` files to version control
- Use Expo's environment variable system for production

### User Data
- Implement data validation
- Add user profile update functionality
- Consider implementing user roles/permissions

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check that your API key is correct in `.env`
   - Ensure the Firebase project is properly configured

2. **"Firebase: Error (auth/email-already-in-use)"**
   - This is expected behavior for existing emails
   - Handle this in your error handling

3. **"Firebase: Error (auth/weak-password)"**
   - Implement password strength validation
   - Show user-friendly error messages

4. **Firestore permission denied**
   - Check your security rules
   - Ensure user is authenticated
   - Verify the user ID matches the document path

### Testing

Use Firebase Emulator Suite for local development:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

The app is configured to automatically connect to emulators in development mode.
