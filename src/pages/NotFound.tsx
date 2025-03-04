import { Box, Button, Container, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 4
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', sm: '8rem' },
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: 2
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            marginBottom: 2
          }}
        >
          Página não encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mb: 4 }}>
          Desculpe, a página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: '#4ECDC4',
            '&:hover': {
              backgroundColor: '#45B7AF'
            },
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Voltar para Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
