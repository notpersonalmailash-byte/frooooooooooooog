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
  { id: '5RHibMrSYH9WRdDd4hbh6N', name: 'Cozy Beats', type: 'SPOTIFY', tier: 'Tadpole' },
  { id: '37i9dQZF1DZ06evO0TOYhj', name: 'Boy w Uki', type: 'SPOTIFY', tier: 'Tadpole' },
  { id: '37i9dQZF1DZ06evO3Ec90s', name: 'Pofu', type: 'SPOTIFY', tier: 'Tadpole' },

  // Polliwog
  { id: 'oZD8dYSGVrc', name: 'Spanish Cafe', type: 'YOUTUBE', tier: 'Polliwog' },
  { id: 'TURbeWK2wwg', name: 'Synthwave Boy', type: 'YOUTUBE', tier: 'Polliwog' },

  // Froglet
  { id: '1FWfsqbg3lTr2pBPcf4i3o', name: 'Parasyte (Spotify)', type: 'SPOTIFY', tier: 'Froglet' },
  { id: '4kUUWyk2EQEFopzAvpqImg', name: 'Hits', type: 'SPOTIFY', tier: 'Froglet' },

  // Hopper
  { id: 'PLeoxRnwmVqfQZCWYczEfAc0XCI4rknrmi', name: 'Drake Vibes', type: 'YOUTUBE', tier: 'Hopper' },
  { id: 'PLNV0nD2r5jTVDTQVQw_ro9hc_W_6LrbZF', name: 'Yeezus Instrumentals', type: 'YOUTUBE', tier: 'Hopper' },

  // Tree Frog
  { id: 'PLNV0nD2r5jTWBKnZtgU-2FqvNkuLv7Vch', name: 'ye', type: 'YOUTUBE', tier: 'Tree Frog' },
  { id: 'PLKupHL0zLuoYSTZx29FxeRgjBk4G4lDnm', name: 'SpiderVerse', type: 'YOUTUBE', tier: 'Tree Frog' },

  // Bullfrog
  { id: 'vZmR38nm3Vo', name: 'You did it.', type: 'YOUTUBE', tier: 'Bullfrog' }
];