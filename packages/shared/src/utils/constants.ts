import type { IcebreakerQuestion } from '../types/user';

export const POPULAR_INTERESTS: string[] = [
  'Language Exchange',
  'Software Development',
  'World Travel',
  'Music Production',
  'Photography',
  'Gaming & Esports',
  'Culinary & Cooking',
  'Fitness & Yoga',
  'Philosophy & Books',
  'AI & Robotics',
  'Cinema & Filmmaking',
  'Design & Architecture',
  'Hiking & Outdoors',
  'Startups & Business',
];

export const MAJOR_REGIONS: string[] = [
  'Global (Anywhere)',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Middle East & North Africa',
  'Sub-Saharan Africa',
];

export const SAMPLE_ICEBREAKERS: IcebreakerQuestion[] = [
  {
    id: 'ib-1',
    category: 'travel',
    question: 'If you could instantly teleport to any city in the world for dinner tonight, where would you go?',
  },
  {
    id: 'ib-2',
    category: 'culture',
    question: 'What is one tradition or local dish from your home culture that everyone should experience?',
  },
  {
    id: 'ib-3',
    category: 'fun',
    question: 'What is the most bizarre or interesting hobby you have ever tried?',
  },
  {
    id: 'ib-4',
    category: 'deep',
    question: 'What is a life lesson you learned in the past year that changed your perspective?',
  },
  {
    id: 'ib-5',
    category: 'fun',
    question: 'If your life had a theme song that played whenever you walked into a room, what would it be?',
  },
];

export const EVENT_CATEGORIES: string[] = [
  'Social & Networking',
  'Language & Cultural Exchange',
  'Technology & Hackathons',
  'Conferences & Workshops',
  'Arts & Music Live',
  'Sports & Wellness',
  'Charity & Community',
];
