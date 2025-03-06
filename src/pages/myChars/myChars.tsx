'use client';
import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, Container, Fade, Grid, Typography, alpha, useMediaQuery } from '@mui/material';
import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import theme from '../../../theme';
import CharCardV2 from '../../components/charCardV2';
import ProgressDashboard from '../../components/progressDashboard/progressDashboard.component';
import { useSession } from '../../SessionContext';
import useCharStore from '../../stores/charStore';

// Interface para os dados dos personagens
interface Character {
  name: string;
  level: number;
  classes: { img: string; className: string }[];
}

function MyChars() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { session, setLoading } = useSession();
  const { userChars, fetchUserCharsData, allChars ,fetchAllCharsData } = useCharStore();
  const navigate = useNavigate();
  const uid = session?.user.uid || '';

  useEffect(() => {
    fetchUserCharsData(uid);
    fetchAllCharsData();
  }, []);

  function onAddCharacter() {
    navigate('/chars/add-user-char');
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        padding: { xs: 2, sm: 3, md: 4 },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
        },
      }}
    >
      <Container maxWidth="xl" sx={{ height: '100%', overflowX: 'hidden' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item flex={1}>
                <Fade in timeout={800}>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    sx={{
                      color: 'white',
                      fontFamily: "faktos, Roboto",
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Meus Personagens
                  </Typography>
                </Fade>
              </Grid>
              <Grid item>
                {userChars && userChars.length > 0 && (
                  <Fade in timeout={1000}>
                    <Button
                      variant="contained"
                      onClick={onAddCharacter}
                      startIcon={<AddIcon />}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: alpha(theme.palette.primary.main, 0.9),
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: theme.palette.primary.main,
                          transform: 'translateY(-2px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        },
                        textTransform: 'none',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 500,
                        boxShadow: theme.shadows[4],
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 }
                      }}
                    >
                      Adicionar Personagem
                    </Button>
                  </Fade>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Characters Grid */}
          <Grid item xs={12} sx={{ flex: 1 }} justifyItems="center">
            <Fade in timeout={1200}>
              <Box
                sx={{
                  height: '100%',
                  maxWidth: { xs: "100%", md: "1000px" },
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '20px',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  p: { xs: 2, sm: 3 },
                  boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${alpha('#000', 0.3)}`,
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {userChars.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: 'white',
                        mb: 2,
                        fontFamily: "faktos",
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      Você ainda não tem personagens cadastrados
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: alpha('#fff', 0.7),
                        mb: 3
                      }}
                    >
                      Clique no botão abaixo para adicionar seu primeiro personagem
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={onAddCharacter}
                      startIcon={<AddIcon />}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: alpha(theme.palette.primary.main, 0.9),
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: theme.palette.primary.main,
                          transform: 'translateY(-2px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        },
                        textTransform: 'none',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 500,
                        boxShadow: theme.shadows[4],
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 }
                      }}
                    >
                      Adicionar Personagem
                    </Button>
                  </Box>
                ) : (
                  <>
                    <ProgressDashboard chars={userChars} allChars={allChars} />
                    <Grid 
                      container 
                      spacing={2.5} 
                      sx={{ 
                        width: '100%',
                        maxWidth: '1400px',
                        margin: '0 auto',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 4
                      }}
                    >
                      <CharCardV2 chars={userChars} onAddCharacter={onAddCharacter} details />
                    </Grid>
                  </>
                )}
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MyChars;
