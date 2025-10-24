import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { auth, db } from '../firebase/config';
import { useDatabase } from '../hooks/useDatabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { createUser, getUser, updateUser, isInitialized } = useDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUserProfile(profile);
            
            // Cache profile locally
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
            
            // Cache in SQLite
            if (isInitialized) {
              await createUser({
                uid: profile.id,
                email: profile.email,
                name: profile.name,
                createdAt: profile.createdAt,
              });
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
        // Clear stored data
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, createUser]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // Store token securely
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
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
      
      // Store token securely
      const token = await user.getIdToken();
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      
      // Clear stored data
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!user) throw new Error('No user to delete');
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete user from Firebase Auth
      await user.delete();
      
      // Clear stored data
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user || !userProfile) throw new Error('No user profile to update');
    
    try {
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setUserProfile(updatedProfile);
      
      // Update local storage
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    updateProfile,
    resetPassword,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
