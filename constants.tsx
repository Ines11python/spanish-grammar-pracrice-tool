
import { Level, GrammarTopic, UserProgress } from './types';

export const GRAMMAR_CATEGORIES = [
  "Conjugation Mastery (By Endings)",
  "Foundations (A1-A2)",
  "Past Tenses (A2-B1)",
  "The Subjunctive Mood (B1-B2)",
  "Advanced Structures (B2)",
  "Core Distinctions"
];

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // Conjugation Mastery
  { id: 'conj_ar', name: 'Regular -ar Verbs', category: 'Conjugation Mastery (By Endings)', level: Level.A1, description: 'Master the patterns for verbs like Hablar, Estudiar, and Trabajar.', isConjugation: true },
  { id: 'conj_er', name: 'Regular -er Verbs', category: 'Conjugation Mastery (By Endings)', level: Level.A1, description: 'Master the patterns for verbs like Comer, Beber, and Leer.', isConjugation: true },
  { id: 'conj_ir', name: 'Regular -ir Verbs', category: 'Conjugation Mastery (By Endings)', level: Level.A1, description: 'Master the patterns for verbs like Vivir, Escribir, and Abrir.', isConjugation: true },
  { id: 'conj_stem', name: 'Stem-Changing Verbs', category: 'Conjugation Mastery (By Endings)', level: Level.A2, description: 'Practice e->ie, o->ue, and e->i changes (e.g., Querer, Dormir).', isConjugation: true },

  // Foundations
  { id: 'pres_irreg', name: 'High-Frequency Irregulars', category: 'Foundations (A1-A2)', level: Level.A1, description: 'Essential verbs: Ser, Estar, Ir, Tener, Hacer, Poner, Salir.' },
  { id: 'obj_pronouns', name: 'Direct & Indirect Objects', category: 'Foundations (A1-A2)', level: Level.A2, description: 'Using "lo, la, le, se" correctly in sentences.' },
  
  // Core Distinctions
  { id: 'ser_estar', name: 'Ser vs Estar', category: 'Core Distinctions', level: Level.A1, description: 'Permanent vs Temporary states and professional distinctions.' },
  { id: 'por_para', name: 'Por vs Para', category: 'Core Distinctions', level: Level.A2, description: 'Mastering cause, destination, time, and purpose.' },
  
  // Past Tenses
  { id: 'pret_reg', name: 'Preterite (Indefinido)', category: 'Past Tenses (A2-B1)', level: Level.A2, description: 'Conjugation and usage for completed past actions.', isConjugation: true },
  { id: 'imp_reg', name: 'Imperfecto', category: 'Past Tenses (A2-B1)', level: Level.A2, description: 'Conjugation for descriptions and habits in the past.', isConjugation: true },
  { id: 'pret_vs_imp', name: 'Preterite vs Imperfect', category: 'Past Tenses (A2-B1)', level: Level.B1, description: 'The ultimate challenge: deciding between specific and habitual past.' },
  
  // Subjunctive
  { id: 'sub_pres', name: 'Present Subjunctive', category: 'The Subjunctive Mood (B1-B2)', level: Level.B1, description: 'Wishes (Ojalá), doubts, and emotional triggers.' },
  { id: 'sub_imp', name: 'Imperfect Subjunctive', category: 'The Subjunctive Mood (B1-B2)', level: Level.B2, description: 'Hypotheticals (Si yo fuera...) and formal requests.' },
  
  // Advanced
  { id: 'relatives', name: 'Relative Pronouns (B2)', category: 'Advanced Structures (B2)', level: Level.B2, description: 'Sophisticated use of "cuyo", "el cual", "quien".' },
  { id: 'connectors', name: 'Logical Connectors', category: 'Advanced Structures (B2)', level: Level.B2, description: 'Academic transition words: "sin embargo", "puesto que", "no obstante".' },
  { id: 'periphrasis', name: 'Verbal Periphrasis', category: 'Advanced Structures (B2)', level: Level.B2, description: 'Action nuances: "llevar + gerundio", "acabar de", "dejar de".' }
];

export const INITIAL_USER_PROGRESS: UserProgress = {
  level: Level.B2,
  completedQuizzes: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  totalMinutes: 0,
  streak: 0,
  lastStudyDate: null,
  averageScore: 0,
  topicMastery: {},
  practicedTopicIds: [],
};
