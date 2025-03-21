import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    raritiesColors: {
      common: string;
      uncommon: string;
      rare: string;
      epic: string;
      legendary: string;
      mythic: string;
    };
  }
  interface PaletteOptions {
    raritiesColors?: {
      common: string;
      uncommon: string;
      rare: string;
      epic: string;
      legendary: string;
      mythic: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    raritiesColors: {
      common: '#ffffff',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000',
      mythic: '#e6cc80',
    },
  },
  // ... rest of theme configuration
});

export default theme; 