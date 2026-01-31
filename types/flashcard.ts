export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface GenerationSession {
  flashcards: Flashcard[];
  sessionId: string;
  createdAt: number;
}
