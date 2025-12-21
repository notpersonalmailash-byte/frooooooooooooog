
import { Theme } from '../types';

export const THEMES: Theme[] = [
  // --- TIER 1: EGG (The Beginning) ---
  {
    id: 'CLASSIC',
    name: 'Classic Pond',
    description: 'The signature look. Fresh, clean, and optimistic.',
    minTier: 'Egg',
    colors: {
      background: '#f8faf9', 
      frog: { 
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
        500: '#40D672', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
      },
      stone: { 
        50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e',
        500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917',
      }
    }
  },
  {
    id: 'MATCHA',
    name: 'Matcha Cream',
    description: 'Soothing cream and soft herbal greens.',
    minTier: 'Egg',
    colors: {
      background: '#fdfcf0', 
      frog: { 
        50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
        500: '#65a30d', 600: '#4d7c0f', 700: '#3f6212', 800: '#365314', 900: '#1a2e05',
      },
      stone: { 
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#d1d5db', 400: '#9ca3af',
        500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
      }
    }
  },

  // --- TIER 2: TADPOLE ---
  {
    id: 'ICICLE',
    name: 'Glacial Morning',
    description: 'Crisp blue tones from the frozen north.',
    minTier: 'Tadpole',
    colors: {
      background: '#f0f9ff', 
      frog: { 
        50: '#e0f2fe', 100: '#bae6fd', 200: '#7dd3fc', 300: '#38bdf8', 400: '#0ea5e9',
        500: '#0284c7', 600: '#0369a1', 700: '#075985', 800: '#0c4a6e', 900: '#082f49',
      },
      stone: { 
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
        500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
      }
    }
  },
  {
    id: 'ESPRESSO',
    name: 'Warm Espresso',
    description: 'Rich coffee browns for late night focus.',
    minTier: 'Tadpole',
    colors: {
      background: '#faf7f5', 
      frog: { 
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
        500: '#d97706', 600: '#b45309', 700: '#92400e', 800: '#78350f', 900: '#451a03',
      },
      stone: { 
        50: '#f5f5f4', 100: '#e7e5e4', 200: '#d6d3d1', 300: '#a8a29e', 400: '#78716c',
        500: '#57534e', 600: '#44403c', 700: '#292524', 800: '#1c1917', 900: '#0c0a09',
      }
    }
  },

  // --- TIER 3: POLLIWOG ---
  {
    id: 'LAVENDER',
    name: 'Petal Drift',
    description: 'Calm purple fields and soft shadows.',
    minTier: 'Polliwog',
    colors: {
      background: '#fafaff', 
      frog: { 
        50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
        500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
      },
      stone: { 
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
        500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
      }
    }
  },

  // --- TIER 4: FROGLET ---
  {
    id: 'SAKURA',
    name: 'Sakura Petal',
    description: 'Spring blossoms and warm pink skies.',
    minTier: 'Froglet',
    colors: {
      background: '#fffcfc', 
      frog: { 
        50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
        500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
      },
      stone: { 
        50: '#f5f5f4', 100: '#e7e5e4', 200: '#d6d3d1', 300: '#a8a29e', 400: '#78716c',
        500: '#57534e', 600: '#44403c', 700: '#292524', 800: '#1c1917', 900: '#0c0a09',
      }
    }
  },

  // --- TIER 5: HOPPER ---
  {
    id: 'DUSK',
    name: 'Ocean Dusk',
    description: 'Deep teal and evening orange highlights.',
    minTier: 'Hopper',
    colors: {
      background: '#081c15', 
      frog: { 
        50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
        500: '#fbbf24', 600: '#f59e0b', 700: '#d97706', 800: '#b45309', 900: '#78350f',
      },
      stone: { 
        50: '#064e3b', 100: '#065f46', 200: '#10b981', 300: '#34d399', 400: '#6ee7b7',
        500: '#a7f3d0', 600: '#d1fae5', 700: '#ecfdf5', 800: '#f0fdf4', 900: '#ffffff',
      }
    }
  },

  // --- TIER 6: TREE FROG ---
  {
    id: 'CYBER',
    name: 'Biolume',
    description: 'High-contrast glowing neon for maximum speed.',
    minTier: 'Tree Frog',
    colors: {
      background: '#020617', 
      frog: { 
        50: '#064e3b', 100: '#065f46', 200: '#047857', 300: '#059669', 400: '#10b981',
        500: '#22d3ee', 600: '#06b6d4', 700: '#0891b2', 800: '#0e7490', 900: '#155e75',
      },
      stone: { 
        50: '#020617', 100: '#0f172a', 200: '#1e293b', 300: '#334155', 400: '#475569',
        500: '#64748b', 600: '#94a3b8', 700: '#cbd5e1', 800: '#e2e8f0', 900: '#f1f5f9',
      }
    }
  },

  // --- TIER 7: BULLFROG ---
  {
    id: 'TOXIC',
    name: 'Toxic Glitch',
    description: 'A dangerous green glow from the deep swamp.',
    minTier: 'Bullfrog',
    colors: {
      background: '#0a0a0a', 
      frog: { 
        50: '#052e16', 100: '#14532d', 200: '#166534', 300: '#15803d', 400: '#16a34a',
        500: '#bef264', 600: '#a3e635', 700: '#84cc16', 800: '#65a30d', 900: '#4d7c0f',
      },
      stone: { 
        50: '#171717', 100: '#262626', 200: '#404040', 300: '#525252', 400: '#737373',
        500: '#a3a3a3', 600: '#d4d4d4', 700: '#e5e5e5', 800: '#f5f5f5', 900: '#ffffff',
      }
    }
  },

  // --- TIER 8: FROG SAGE (The Capstone) ---
  {
    id: 'INK',
    name: 'Ink & Parchment',
    description: 'The requested Black & White masterpiece. Sharp and timeless.',
    minTier: 'Frog Sage',
    colors: {
      background: '#ffffff', 
      frog: { 
        50: '#f5f5f5', 100: '#e5e5e5', 200: '#d4d4d4', 300: '#a3a3a3', 400: '#737373',
        500: '#000000', 600: '#171717', 700: '#262626', 800: '#404040', 900: '#525252',
      },
      stone: { 
        50: '#ffffff', 100: '#fafafa', 200: '#f5f5f5', 300: '#e5e5e5', 400: '#d4d4d4',
        500: '#a3a3a3', 600: '#737373', 700: '#525252', 800: '#404040', 900: '#262626',
      }
    }
  },
  {
    id: 'GALAXY',
    name: 'Abyssal Sage',
    description: 'Where the stars themselves spell out the wisdom of the pond.',
    minTier: 'Frog Sage',
    colors: {
      background: '#020205', 
      frog: { 
        50: '#1e1b4b', 100: '#312e81', 200: '#3730a3', 300: '#4338ca', 400: '#4f46e5',
        500: '#818cf8', 600: '#a5b4fc', 700: '#c7d2fe', 800: '#e0e7ff', 900: '#eef2ff',
      },
      stone: { 
        50: '#000000', 100: '#0f172a', 200: '#1e293b', 300: '#334155', 400: '#475569',
        500: '#64748b', 600: '#94a3b8', 700: '#cbd5e1', 800: '#e2e8f0', 900: '#f1f5f9',
      }
    }
  }
];
