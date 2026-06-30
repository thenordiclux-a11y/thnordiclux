export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Display date e.g. "Mar 15, 2026" */
  date: string;
  readTimeMinutes: number;
  image: string;
  category?: string;
  /** Article body as paragraphs (plain text). */
  body: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'winter-skincare-layering',
    title: 'How to Layer Skincare in Cold Weather',
    excerpt:
      'A simple order for serums, moisturizers, and SPF so your barrier stays calm when the temperature drops.',
    date: 'Mar 12, 2026',
    readTimeMinutes: 6,
    category: 'Skincare',
    image:
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=500&fit=crop&q=80',
    body: [
      'Cold air and indoor heat pull moisture from the skin, so winter is the season to be deliberate about layering.',
      'Start with a gentle, hydrating cleanser, then a water-based serum while the skin is slightly damp. Follow with a cream or balm that seals without feeling greasy.',
      'If you use actives like retinol or acids, sandwich them between hydrating layers on nights when your skin feels tight.',
      'Finish every morning with SPF—UVA passes through clouds and windows year-round.',
    ],
  },
  {
    slug: 'reading-ingredient-labels',
    title: 'Reading Ingredient Labels Without the Stress',
    excerpt:
      'What order means on the INCI list, and how to spot patterns that match your goals.',
    date: 'Mar 8, 2026',
    readTimeMinutes: 5,
    category: 'Education',
    image:
      'https://images.unsplash.com/photo-1620916566398-39b1148bad5e?w=800&h=500&fit=crop&q=80',
    body: [
      'Ingredients are listed from highest to lowest concentration until you reach about 1%, after which order can vary.',
      'Fragrance and essential oils appear near the bottom when used in small amounts—but they can still matter for sensitive skin.',
      'Focus on the first five to eight ingredients for texture and base; look for actives you recognize and research in context of the full formula.',
    ],
  },
  {
    slug: 'minimal-makeup-fresh-face',
    title: 'Minimal Makeup for a Fresh Everyday Face',
    excerpt:
      'Tinted moisture, cream blush, and one multi-use product can shorten your routine.',
    date: 'Mar 1, 2026',
    readTimeMinutes: 4,
    category: 'Makeup',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop&q=80',
    body: [
      'Prep skin with a thin layer of moisturizer so complexion products sit evenly.',
      'Choose one complexion step—tinted serum, light foundation, or concealer only where needed.',
      'Add warmth with cream blush on cheeks and a touch on lids; finish with brow gel and mascara.',
    ],
  },
  {
    slug: 'pantry-snacks-better-energy',
    title: 'Pantry Snacks That Keep Energy Steady',
    excerpt:
      'Pairing protein with fiber-rich carbs for afternoons when you want to skip the sugar crash.',
    date: 'Feb 22, 2026',
    readTimeMinutes: 5,
    category: 'Wellness',
    image:
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&h=500&fit=crop&q=80',
    body: [
      'Quick snacks work best when they combine satisfaction with staying power.',
      'Think yogurt with fruit, nut butter on whole-grain crackers, or a small handful of trail mix with dried fruit.',
      'Keep water nearby—thirst often reads as hunger in the middle of the day.',
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
