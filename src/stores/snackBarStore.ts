import { create } from 'zustand';

// Tipos para as propriedades do Snackbar
type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

type SnackbarState = {
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
    position: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
    showSnackbar: (
        message: string,
        severity?: SnackbarSeverity,
        position?: {
            vertical: 'top' | 'bottom';
            horizontal: 'left' | 'center' | 'right';
        }
    ) => void;
    hideSnackbar: () => void;
};

// Cria a store global
export const useSnackbarStore = create<SnackbarState>(set => ({
    open: false,
    message: '',
    severity: 'info', // Valor padrão
    position: {
        vertical: 'bottom',
        horizontal: 'left'
    },
    showSnackbar: (
        message,
        severity = 'info',
        position = { vertical: 'bottom', horizontal: 'left' }
    ) => {
        set({ open: true, message, severity, position });
    },
    hideSnackbar: () => set({ open: false })
}));
