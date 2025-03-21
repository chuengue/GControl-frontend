import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Container, Paper, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error: propError, resetError }) => {
  const navigate = useNavigate();
  const routeError = useRouteError();
  const theme = useTheme();

  const error =
    propError ||
    (routeError instanceof Error ? routeError : new Error('An unexpected error occurred'));
  const errorMessage = isRouteErrorResponse(routeError) ? routeError.statusText : error.message;

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: 2,
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[8]
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 64,
              color: 'error.main',
              mb: 2
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}
          >
            Ops! Algo deu errado
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {errorMessage || 'Ocorreu um erro inesperado'}
          </Typography>

          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={() => resetError?.() || window.location.reload()}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Tentar Novamente
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Voltar para Home
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Se o problema persistir, entre em contato com o suporte
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorPage;
