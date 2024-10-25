import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  DocumentData 
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { 
  Quiz, 
  User, 
  Result, 
  Category, 
  Leaderboard,
  LeaderboardEntry 
} from '../types';

// Authentication Operations
export const authService = {
  async register(email: string, password: string, username: string): Promise<string> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile with username
      await updateProfile(firebaseUser, {
        displayName: username
      });

      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        username,
        email,
        badges: ['Nybegynner'],
        quizzes_taken: [],
        created_at: new Date(),
        profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      return firebaseUser.uid;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
};

// Quiz Operations
export const quizService = {
  async getAllQuizzes(): Promise<Quiz[]> {
    const quizSnapshot = await getDocs(collection(db, 'quizzes'));
    return quizSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? 
          data.created_at.toDate() : 
          new Date(data.created_at)
      } as Quiz;
    });
  },

  async getQuizById(id: string): Promise<Quiz | null> {
    const quizDoc = await getDoc(doc(db, 'quizzes', id));
    if (!quizDoc.exists()) return null;
    const data = quizDoc.data();
    return {
      id: quizDoc.id,
      ...data,
      created_at: data.created_at instanceof Timestamp ? 
        data.created_at.toDate() : 
        new Date(data.created_at)
    } as Quiz;
  },

  async getQuizzesByCategory(category: string): Promise<Quiz[]> {
    const q = query(collection(db, 'quizzes'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? 
          data.created_at.toDate() : 
          new Date(data.created_at)
      } as Quiz;
    });
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'quizzes'), {
      ...quiz,
      created_at: Timestamp.now()
    });
    return docRef.id;
  }
};

// User Operations
export const userService = {
  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      created_at: Timestamp.now()
    });
    return docRef.id;
  },

  async getUserById(id: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', id));
    if (!userDoc.exists()) return null;
    const data = userDoc.data();
    return {
      id: userDoc.id,
      ...data,
      created_at: data.created_at instanceof Timestamp ? 
        data.created_at.toDate() : 
        new Date(data.created_at)
    } as User;
  },

  async updateUserQuizzes(userId: string, quizTaken: { quiz_id: string; score: number }): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data();
    const quizzes_taken = [...(userData.quizzes_taken || []), {
      ...quizTaken,
      completion_time: Timestamp.now()
    }];

    await updateDoc(userRef, { quizzes_taken });
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);

    // Update Firebase Auth profile if username or profile picture is updated
    const currentUser = auth.currentUser;
    if (currentUser && (updates.username || updates.profile_picture)) {
      await updateProfile(currentUser, {
        displayName: updates.username,
        photoURL: updates.profile_picture
      });
    }
  }
};

// Results Operations
export const resultService = {
  async saveResult(result: Omit<Result, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'results'), {
      ...result,
      completion_time: Timestamp.now()
    });
    return docRef.id;
  },

  async getResultsByUser(userId: string): Promise<Result[]> {
    const q = query(
      collection(db, 'results'),
      where('user_id', '==', userId),
      orderBy('completion_time', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        completion_time: data.completion_time instanceof Timestamp ? 
          data.completion_time.toDate() : 
          new Date(data.completion_time)
      } as Result;
    });
  }
};

// Category Operations
export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const categorySnapshot = await getDocs(collection(db, 'categories'));
    return categorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'categories'), category);
    return docRef.id;
  }
};

// Leaderboard Operations
export const leaderboardService = {
  async getLeaderboard(type: string, categoryId?: string): Promise<Leaderboard | null> {
    try {
      const leaderboardId = categoryId ? `${type}_${categoryId}` : type;
      const leaderboardDoc = await getDoc(doc(db, 'leaderboard', leaderboardId));
      
      if (!leaderboardDoc.exists()) {
        const emptyLeaderboard: Leaderboard = {
          id: leaderboardId,
          type: type as 'global' | 'category' | 'weekly',
          category: categoryId,
          users: []
        };
        await setDoc(doc(db, 'leaderboard', leaderboardId), emptyLeaderboard);
        return emptyLeaderboard;
      }

      return {
        id: leaderboardDoc.id,
        ...leaderboardDoc.data()
      } as Leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return null;
    }
  },

  async updateLeaderboard(
    type: string,
    userId: string,
    score: number,
    categoryId?: string
  ): Promise<void> {
    try {
      const leaderboardId = categoryId ? `${type}_${categoryId}` : type;
      const leaderboardRef = doc(db, 'leaderboard', leaderboardId);
      const leaderboardDoc = await getDoc(leaderboardRef);

      let leaderboard: Leaderboard;

      if (!leaderboardDoc.exists()) {
        leaderboard = {
          id: leaderboardId,
          type: type as 'global' | 'category' | 'weekly',
          ...(categoryId ? { category: categoryId } : {}), // Only add `category` if defined
          users: [
            {
              user_id: userId,
              score,
              rank: 1,
            },
          ],
        };
      } else {
        leaderboard = leaderboardDoc.data() as Leaderboard;
        const users = Array.isArray(leaderboard.users) ? leaderboard.users : [];
        const userIndex = users.findIndex((u) => u.user_id === userId);

        if (userIndex !== -1) {
          if (users[userIndex].score < score) {
            users[userIndex].score = score;
          }
        } else {
          users.push({
            user_id: userId,
            score,
            rank: users.length + 1,
          });
        }

        users.sort((a, b) => b.score - a.score);
        users.forEach((user, index) => {
          user.rank = index + 1;
        });

        leaderboard.users = users.slice(0, 100);
      }

      await setDoc(leaderboardRef, leaderboard);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  },
};
