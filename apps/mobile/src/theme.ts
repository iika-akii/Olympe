import { useColorScheme } from 'react-native';

export interface Theme {
  bg: string; card: string; text: string; muted: string; border: string;
  accent: string; accentSoft: string; onAccent: string;
  partner: string; partnerSoft: string;
  warn: string; warnSoft: string;
  danger: string; dangerSoft: string;
}

const light: Theme = {
  bg: '#F6F4EF', card: '#FFFFFF', text: '#1D1F1C', muted: '#6B6F68', border: '#E3E0D8',
  accent: '#2F6B4F', accentSoft: '#E3EFE7', onAccent: '#FFFFFF',
  partner: '#6B4E9B', partnerSoft: '#EEE8F6',
  warn: '#8A5200', warnSoft: '#FBF0DC',
  danger: '#A63D2F', dangerSoft: '#F8E3DF',
};

const dark: Theme = {
  bg: '#121412', card: '#1C1F1C', text: '#ECEDE9', muted: '#A3A79F', border: '#2C302C',
  accent: '#7CC39B', accentSoft: '#1F3328', onAccent: '#0E1A13',
  partner: '#B9A3E0', partnerSoft: '#2A2338',
  warn: '#E6B566', warnSoft: '#3A2E1A',
  danger: '#EB8F82', dangerSoft: '#3A221E',
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
