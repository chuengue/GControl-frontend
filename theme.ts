'use client';
import '@fontsource/anton/400.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme } from '@mui/material/styles';
import './index.css';

// Definição das cores personalizadas para raridades
declare module '@mui/material/styles' {
  interface Palette {
    raritiesColors: {
      common: string;
      rare: string;
      epic: string;
      legendary: string;
      ancestral: string;
    };
  }
  interface PaletteOptions {
    raritiesColors?: {
      common: string;
      rare: string;
      epic: string;
      legendary: string;
      ancestral: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',

    raritiesColors: {
      common: '#8a8a8a',
      rare: '#00ccff',
      epic: '#ffeb00',
      legendary: '#e262e8',
      ancestral: '#EF2F77'
    }
  },
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme'
  },
  colorSchemes: { light: false, dark: true }
});

export default theme;
