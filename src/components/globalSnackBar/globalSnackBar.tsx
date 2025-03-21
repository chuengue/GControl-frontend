import { Snackbar } from '@mui/material';
import React from 'react';
import { useSnackbarStore } from '../../stores/snackBarStore';

import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

export const GlobalSnackbar = () => {
    const { open, message, severity, position, hideSnackbar } =
        useSnackbarStore();

    return (
        <Snackbar
            open={open}
            autoHideDuration={2000} // Tempo que o Snackbar fica visível
            onClose={hideSnackbar}
            anchorOrigin={position}
        >
            <Alert onClose={hideSnackbar} severity={severity}>
                {message}
            </Alert>
        </Snackbar>
    );
};
