import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService, userService } from '../services/firebaseService';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  register: (email: string, password: string, username: string) => Promise<string>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await userService.getUserById(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    const profile = await userService.getUserById(user.uid);
    setUserProfile(profile);
    return user;
  };

  const register = async (email: string, password: string, username: string) => {
    const userId = await authService.register(email, password, username);
    const profile = await userService.getUserById(userId);
    setUserProfile(profile);
    return userId;
  };

  const logout = async () => {
    await authService.logout();
    setUserProfile(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('No authenticated user');
    await userService.updateUserProfile(currentUser.uid, updates);
    const updatedProfile = await userService.getUserById(currentUser.uid);
    setUserProfile(updatedProfile);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
