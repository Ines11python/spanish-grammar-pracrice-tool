
export enum Level {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2'
}

export interface Question {
  id: string;
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  grammarTopic: string;
  level: Level;
}

export interface GrammarTopic {
  id: string;
  name: string;
  category: string;
  level: Level;
  description: string;
  isConjugation?: boolean;
}

export interface UserProgress {
  level: Level;
  completedQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  totalMinutes: number;
  streak: number;
  lastStudyDate: string | null; // ISO string
  averageScore: number;
  topicMastery: Record<string, number>;
  practicedTopicIds: string[];
}
