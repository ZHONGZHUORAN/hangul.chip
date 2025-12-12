export type JamoType = 'initial' | 'medial' | 'final';

export interface JamoData {
  char: string;
  name: string;
  romaja: string;
  type: JamoType[];
}

export interface PuzzlePiece {
  id: string;
  char: string;
  romaja?: string; // Added Romanization
  x: number;
  y: number;
  type: 'consonant' | 'vowel';
  imageUrl?: string; // Data URL for handwritten chips
}

export interface Lesson {
  id: string;
  title: string;
  difficulty: number;
  description: string;
  content: string; // The goal word/sentence
  hint?: string;
}

export interface Mission {
    target: string;      // The Korean word to build
    translation: string; // English meaning
    romaja: string;      // Romanization
    components: string[]; // List of Jamo chars needed
    reward: number;      // XP value
    completed: boolean;
    type?: 'word' | 'sentence';
}

export interface UserProgress {
    xp: number;
    level: number;
}

export interface VocabularyItem {
    id: string;
    target: string;
    translation: string;
    romaja: string;
    learnedAt: number; // Timestamp
}