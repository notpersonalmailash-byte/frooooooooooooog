import { Theme } from '../types';

export const THEMES: Theme[] = [
  // --- EGG TIER ---
  {
    id: 'CLASSIC',
    name: 'Classic Pond',
    description: 'The signature fresh look.',
    minTier: 'Egg',
    colors: {
      background: '#f7f7f5', 
      frog: { 
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#40D672',
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
    name: 'Matcha Tea',
    description: 'A soothing blend of cream and tea leaves.',
    minTier: 'Egg',
    colors: {
      background: '#fcfdf5', // Cream
      frog: { 
        50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
        500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314',
      },
      stone: { 
        50: '#fefce8', 100: '#fef9c3', 200: '#fde047', 300: '#d1d5db', 400: '#9ca3af',
        500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
      }
    }
  },

  // --- TADPOLE TIER ---
  {
    id: 'ICICLE',
    name: 'Glacial Ice',
    description: 'Crisp, cool, and crystal clear.',
    minTier: 'Tadpole',
    colors: {
      background: '#f0f9ff', // Sky 50
      frog: { 
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
        500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
      },
      stone: { 
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
        500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
      }
    }
  },
  {
    id: 'COFFEE',
    name: 'Morning Brew',
    description: 'Warm latte tones for a cozy session.',
    minTier: 'Tadpole',
    colors: {
      background: '#fffbeb', // Amber 50
      frog: { 
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
        500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
      },
      stone: { 
        50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e',
        500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917',
      }
    }
  },
  {
    id: 'MIDNIGHT',
    name: 'Void Marsh',
    description: 'Bioluminescent whispers drift through the velvet darkness.',
    minTier: 'Tadpole',
    colors: {
      background: '#020617', // Slate 950
      frog: { 
        50: '#022c22', 100: '#064e3b', 200: '#065f46', 300: '#047857', 400: '#059669',
        500: '#10b981', 600: '#34d399', 700: '#6ee7b7', 800: '#a7f3d0', 900: '#ecfdf5',
      },
      stone: { 
        50: '#0f172a', 100: '#1e293b', 200: '#334155', 300: '#475569', 400: '#64748b',
        500: '#94a3b8', 600: '#cbd5e1', 700: '#e2e8f0', 800: '#f1f5f9', 900: '#f8fafc',
      }
    }
  },

  // --- POLLIWOG TIER ---
  {
    id: 'LAVENDER',
    name: 'Lavender Field',
    description: 'Soft purples and calming scents.',
    minTier: 'Polliwog',
    colors: {
      background: '#faf5ff', // Purple 50
      frog: { 
        50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
        500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87',
      },
      stone: { 
        50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
        500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b',
      }
    }
  },
  {
    id: 'FOREST',
    name: 'Deep Woods',
    description: 'Dark mode for the nature lover.',
    minTier: 'Polliwog',
    colors: {
      background: '#052e16', // Green 950
      frog: { 
        50: '#022c22', 100: '#064e3b', 200: '#065f46', 300: '#047857', 400: '#059669',
        500: '#10b981', 600: '#34d399', 700: '#6ee7b7', 800: '#a7f3d0', 900: '#ecfdf5',
      },
      stone: { 
        // Inverted Green-Greys
        50: '#064e3b', 100: '#065f46', 200: '#047857', 300: '#374151', 400: '#4b5563',
        500: '#6b7280', 600: '#9ca3af', 700: '#d1d5db', 800: '#e5e7eb', 900: '#f3f4f6',
      }
    }
  },

  // --- FROGLET TIER ---
  {
    id: 'OCEAN',
    name: 'Deep Blue',
    description: 'The calm of the open sea.',
    minTier: 'Froglet',
    colors: {
      background: '#ecfeff', // Cyan 50
      frog: { 
        50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
        500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63',
      },
      stone: { 
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
        500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
      }
    }
  },
  {
    id: 'SAKURA',
    name: 'Spirit Blossom',
    description: 'Where falling petals carry the memories of the ancestors.',
    minTier: 'Froglet',
    colors: {
      background: '#fff1f2', // Rose 50
      frog: { 
        50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
        500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
      },
      stone: { 
        50: '#fffbfb', 100: '#fff5f5', 200: '#fed7d7', 300: '#feb2b2', 400: '#fc8181',
        500: '#f56565', 600: '#e53e3e', 700: '#c53030', 800: '#9b2c2c', 900: '#742a2a',
      }
    }
  },
  {
    id: 'NOIR',
    name: 'Noir',
    description: 'Monochrome elegance for the night shift.',
    minTier: 'Froglet',
    colors: {
      background: '#0a0a0a', // Neutral 950
      frog: { 
        50: '#262626', 100: '#404040', 200: '#525252', 300: '#737373', 400: '#a3a3a3',
        500: '#d4d4d4', 600: '#e5e5e5', 700: '#f5f5f5', 800: '#fafafa', 900: '#ffffff',
      },
      stone: { 
        // Inverted Greys
        50: '#171717', 100: '#262626', 200: '#404040', 300: '#525252', 400: '#737373',
        500: '#a3a3a3', 600: '#d4d4d4', 700: '#e5e5e5', 800: '#f5f5f5', 900: '#ffffff',
      }
    }
  },

  // --- HOPPER TIER ---
  {
    id: 'CANDY',
    name: 'Sugar Rush',
    description: 'Bright pastels and popping colors.',
    minTier: 'Hopper',
    colors: {
      background: '#fff1f2', // Pink 50
      frog: { 
        50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6',
        500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843',
      },
      stone: { 
        50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
        500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
      }
    }
  },
  {
    id: 'VAMPIRE',
    name: 'Nosferatu',
    description: 'Blood red shadows.',
    minTier: 'Hopper',
    colors: {
      background: '#000000',
      frog: { 
        50: '#450a0a', 100: '#7f1d1d', 200: '#991b1b', 300: '#b91c1c', 400: '#dc2626',
        500: '#ef4444', 600: '#f87171', 700: '#fca5a5', 800: '#fecaca', 900: '#fee2e2',
      },
      stone: { 
        // Inverted Red-Greys
        50: '#1a0505', 100: '#2b0a0a', 200: '#450a0a', 300: '#57534e', 400: '#78716c',
        500: '#a8a29e', 600: '#d6d3d1', 700: '#e7e5e4', 800: '#f5f5f4', 900: '#fafaf9',
      }
    }
  },

  // --- TREE FROG TIER ---
  {
    id: 'CYBER',
    name: 'Neon Nexus',
    description: 'The digital dreamscape where reality and code converge.',
    minTier: 'Tree Frog',
    colors: {
      background: '#000000',
      frog: { 
        50: '#052e16', 100: '#14532d', 200: '#166534', 300: '#15803d', 400: '#16a34a',
        500: '#22c55e', 600: '#4ade80', 700: '#86efac', 800: '#bbf7d0', 900: '#dcfce7',
      },
      stone: { 
        // Inverted
        50: '#000000', 100: '#022c22', 200: '#064e3b', 300: '#065f46', 400: '#10b981',
        500: '#34d399', 600: '#6ee7b7', 700: '#a7f3d0', 800: '#d1fae5', 900: '#ecfdf5',
      }
    }
  },
  {
    id: 'SUNSET',
    name: 'Dusk Horizon',
    description: 'The warm glow of the fading sun.',
    minTier: 'Tree Frog',
    colors: {
      background: '#2a0a18', // Deep Purple/Red
      frog: { 
        50: '#431407', 100: '#7c2d12', 200: '#9a3412', 300: '#c2410c', 400: '#ea580c',
        500: '#f97316', 600: '#fb923c', 700: '#fdba74', 800: '#fed7aa', 900: '#ffedd5',
      },
      stone: { 
        // Inverted Warm
        50: '#1f1008', 100: '#431407', 200: '#5e200c', 300: '#78350f', 400: '#92400e',
        500: '#b45309', 600: '#d6d3d1', 700: '#e7e5e4', 800: '#f5f5f4', 900: '#fafaf9',
      }
    }
  },

  // --- BULLFROG TIER ---
  {
    id: 'TOXIC',
    name: 'Biohazard',
    description: 'Dangerous and radiant.',
    minTier: 'Bullfrog',
    colors: {
      background: '#0f1d04', // Very dark lime
      frog: { 
        50: '#1a2e05', 100: '#365314', 200: '#3f6212', 300: '#4d7c0f', 400: '#65a30d',
        500: '#84cc16', 600: '#a3e635', 700: '#bef264', 800: '#d9f99d', 900: '#ecfccb',
      },
      stone: { 
        // Inverted Slate/Lime mix
        50: '#020617', 100: '#0f172a', 200: '#1e293b', 300: '#334155', 400: '#475569',
        500: '#64748b', 600: '#94a3b8', 700: '#cbd5e1', 800: '#e2e8f0', 900: '#f1f5f9',
      }
    }
  },

  // --- FROG SAGE TIER ---
  {
    id: 'ROYAL',
    name: 'Celestial Court',
    description: 'Gilded halls floating amongst the stars.',
    minTier: 'Frog Sage',
    colors: {
      background: '#2e1065', // Violet 950
      frog: { // Gold
        50: '#451a03', 100: '#78350f', 200: '#92400e', 300: '#b45309', 400: '#d97706',
        500: '#f59e0b', 600: '#fbbf24', 700: '#fcd34d', 800: '#fde68a', 900: '#fffbeb',
      },
      stone: { // Purple Tinted Inverted
        50: '#1e1b4b', 100: '#312e81', 200: '#3730a3', 300: '#4338ca', 400: '#4f46e5',
        500: '#6366f1', 600: '#818cf8', 700: '#a5b4fc', 800: '#c7d2fe', 900: '#e0e7ff',
      }
    }
  },
  {
    id: 'GALAXY',
    name: 'Andromeda',
    description: 'The infinite expanse of the cosmos.',
    minTier: 'Frog Sage',
    colors: {
      background: '#0f172a', // Slate 900
      frog: { 
        50: '#312e81', 100: '#3730a3', 200: '#4338ca', 300: '#4f46e5', 400: '#6366f1',
        500: '#818cf8', 600: '#a5b4fc', 700: '#c7d2fe', 800: '#e0e7ff', 900: '#eef2ff',
      },
      stone: { 
        // Inverted Blue-Grey
        50: '#020617', 100: '#0f172a', 200: '#1e293b', 300: '#334155', 400: '#475569',
        500: '#64748b', 600: '#94a3b8', 700: '#cbd5e1', 800: '#e2e8f0', 900: '#f1f5f9',
      }
    }
  }
];