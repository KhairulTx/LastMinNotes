import type { Flashcard } from '@/types/flashcard';

/**
 * Sample flashcards shown before payment as marketing preview.
 * Users see the format and quality they'll get after paying.
 */
export const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'sample-1',
    question: 'What is the main function of mitochondria in a cell?',
    answer: 'Mitochondria are the powerhouse of the cell. They produce ATP (adenosine triphosphate) through cellular respiration, providing energy for cellular activities.',
  },
  {
    id: 'sample-2',
    question: 'Define the law of supply and demand.',
    answer: 'The law states that when demand for a product increases, its price tends to rise. Conversely, when supply exceeds demand, prices tend to fall. Market equilibrium occurs where supply meets demand.',
  },
  {
    id: 'sample-3',
    question: 'What are the three branches of government?',
    answer: 'The three branches are: (1) Legislative – makes laws, (2) Executive – enforces laws, (3) Judicial – interprets laws. This separation ensures checks and balances.',
  },
];
