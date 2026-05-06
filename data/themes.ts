
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
    id: 'OCEAN',
    name: 'Ocean Breeze',
    description: 'Fresh teal waters and bright sunlit sands.',
    minTier: 'Hopper',
    colors: {
      background: '#f0fdfa', 
      frog: { 
        50: '#ccfbf1', 100: '#99f6e4', 200: '#5eead4', 300: '#2dd4bf', 400: '#14b8a6',
        500: '#0d9488', 600: '#0f766e', 700: '#115e59', 800: '#134e4a', 900: '#042f2e',
      },
      stone: { 
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
        500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
      }
    }
  },

  // --- TIER 6: TREE FROG ---
  {
    id: 'SUNSET',
    name: 'Golden Sunset',
    description: 'Warm evening light with fiery orange streaks.',
    minTier: 'Tree Frog',
    colors: {
      background: '#fffbeb', 
      frog: { 
        50: '#fef3c7', 100: '#fde68a', 200: '#fcd34d', 300: '#fbbf24', 400: '#f59e0b',
        500: '#d97706', 600: '#b45309', 700: '#92400e', 800: '#78350f', 900: '#451a03',
      },
      stone: { 
        50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e',
        500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917',
      }
    }
  },

  // --- TIER 7: BULLFROG ---
  {
    id: 'MINT',
    name: 'Crisp Mint',
    description: 'Extremely clean white backgrounds with piercing mint greens.',
    minTier: 'Bullfrog',
    colors: {
      background: '#ffffff', 
      frog: { 
        50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
        500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
      },
      stone: { 
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
        500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
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
    id: 'DAWN',
    name: 'Morning Dawn',
    description: 'A beautiful bright sunrise to start the typing journey anew.',
    minTier: 'Frog Sage',
    colors: {
      background: '#fdf4ff', 
      frog: { 
        50: '#fae8ff', 100: '#f5d0fe', 200: '#f0abfc', 300: '#e879f9', 400: '#d946ef',
        500: '#c026d3', 600: '#a21caf', 700: '#86198f', 800: '#701a75', 900: '#4a044e',
      },
      stone: { 
        50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
        500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
      }
    }
  }
];
