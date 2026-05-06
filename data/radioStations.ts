import { MusicSource } from '../types';

export interface RadioStation {
  id: string;
  name: string;
  type: MusicSource;
  tier: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  // Tadpole (Unlock Radio Feature)
  { id: '1YBtzAAChU8', name: 'Lofi Girl Christmas', type: 'YOUTUBE', tier: 'Tadpole' },
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl - chill space', type: 'YOUTUBE', tier: 'Tadpole' },
  { id: '4xDzrDKqGNo', name: 'Lofi Hip Hop', type: 'YOUTUBE', tier: 'Tadpole' },
  { id: '7NOSDKb0HlU', name: 'Chillhop Beats', type: 'YOUTUBE', tier: 'Tadpole' },

  // Polliwog
  { id: 'oZD8dYSGVrc', name: 'Spanish Cafe', type: 'YOUTUBE', tier: 'Polliwog' },
  { id: 'TURbeWK2wwg', name: 'Synthwave Boy', type: 'YOUTUBE', tier: 'Polliwog' },

  // Froglet
  { id: 'kgx4WGK0oNU', name: 'Jazz Relax', type: 'YOUTUBE', tier: 'Froglet' },
  { id: '5yx6BWlEVcU', name: 'Chillstep', type: 'YOUTUBE', tier: 'Froglet' },

  // Hopper
  { id: 'PLeoxRnwmVqfQZCWYczEfAc0XCI4rknrmi', name: 'Drake Vibes', type: 'YOUTUBE', tier: 'Hopper' },
  { id: 'PLNV0nD2r5jTVDTQVQw_ro9hc_W_6LrbZF', name: 'Yeezus Instrumentals', type: 'YOUTUBE', tier: 'Hopper' },

  // Tree Frog
  { id: 'PLNV0nD2r5jTWBKnZtgU-2FqvNkuLv7Vch', name: 'ye', type: 'YOUTUBE', tier: 'Tree Frog' },
  { id: 'PLKupHL0zLuoYSTZx29FxeRgjBk4G4lDnm', name: 'SpiderVerse', type: 'YOUTUBE', tier: 'Tree Frog' },

  // Bullfrog
  { id: 'vZmR38nm3Vo', name: 'You did it.', type: 'YOUTUBE', tier: 'Bullfrog' }
];