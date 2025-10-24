import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import * as SecureStore from 'expo-secure-store';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
};

export const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      
      // Store token and profile locally
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, await user.getIdToken());
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
      
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, name: string): Promise<UserProfile | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      id: user.uid,
      email: user.email!,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Store token and profile locally
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, await user.getIdToken());
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    
    return userProfile;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    
    // Clear stored data
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const storedProfile = await SecureStore.getItemAsync(STORAGE_KEYS.USER_PROFILE);
    
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.USER_TOKEN);
    return token !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

