import { Alert, Snackbar } from '@mui/material';
import React from 'react';
import { useSnackbarStore } from '../../stores/snackBarStore';

export const GlobalSnackbar = () => {
    const { open, message, severity, position, hideSnackbar } =
        useSnackbarStore();

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000} // Tempo que o Snackbar fica visível
            onClose={hideSnackbar}
            anchorOrigin={position}
        >
            <Alert
                onClose={hideSnackbar}
                severity={severity}
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};
