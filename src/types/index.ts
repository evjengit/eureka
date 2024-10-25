export interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  image_url?: string;
}

export interface Quiz {
  id?: string;
  title: string;
  category: string;
  difficulty: 'Nybegynner' | 'Middels' | 'Ekspert';
  description: string;
  questions: Question[];
  created_by: string;
  created_at: Date;
}

export interface QuizTaken {
  quiz_id: string;
  score: number;
  completion_time: Date;
}

export interface User {
  id?: string;
  username: string;
  email: string;
  profile_picture?: string;
  badges: string[];
  quizzes_taken: QuizTaken[];
  created_at: Date;
}

export interface Result {
  id?: string;
  user_id: string;
  quiz_id: string;
  score: number;
  correct_answers: number;
  completion_time: Date;
  duration: number;
}

export interface Category {
  id?: string;
  name: string;
  description: string;
  image_url?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  score: number;
  rank: number;
}

export interface Leaderboard {
  id?: string;
  type: 'global' | 'category' | 'weekly';
  category?: string;
  users: LeaderboardEntry[];
}

// Helper type for creating new documents
export type WithoutId<T> = Omit<T, 'id'>;

// Helper type for creating new documents without timestamps
export type WithoutTimestamps<T> = Omit<T, 'created_at' | 'completion_time'>;
