'use client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme } from '@mui/material/styles';
import './index.css';
import './src/assets/fonts/faktos.ttf';

const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif' // Define Roboto como fonte padrão
    },
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme'
    },
    colorSchemes: { light: true, dark: true }
});

export default theme;
