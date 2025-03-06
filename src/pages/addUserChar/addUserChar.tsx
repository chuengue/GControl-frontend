import { InfoOutlined, PersonAdd } from '@mui/icons-material';
import { alpha, Box, Button, Card, CircularProgress, Fade, Grid, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';

import theme from '../../../theme';
import TotalAtkCalculator from '../../components/atackTotalCalculator.ts/atackTotalCalculator';
import { GreenSwitch } from '../../components/charCard/styles';
import SelectableImage from '../../components/selectableImage/selectableImage';
import { Character } from '../../interfaces/char';
import { RegisterUserCharacter } from '../../service/requests/gameChar';
import { useSession } from '../../SessionContext';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';

function AddUserChar() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    fetchAllCharsData,
    allChars,
    userChars,
    fetchUserCharsData,
    attackTotal,
    charStats,
    setAttackTotal,
    setCharStats
  } = useCharStore();
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const { session } = useSession();
  const { showSnackbar } = useSnackbarStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [level, setLevel] = useState<string>('');
  const [isVisibleInRanking, setIsVisibleInRanking] = useState<boolean>(true);

  const getOwnedCharIds = (charId: string) => {
    return userChars.some(userChar => userChar.gameChar.id === charId);
  };

  const getAllChars = async () => {
    if (!userChars || userChars.length === 0) {
      if (session) await fetchUserCharsData(session.user.uid);
    }
  };

  useEffect(() => {
    fetchAllCharsData();
    getAllChars();
  }, []);

  const handleSelectChar = (char: Character) => {
    if (selectedChar) {
      setCharStats({
        attack: 0,
        defense: 0,
        hp: 0,
        specialAttack: 0,
        specialDefense: 0,
        criticalStrike: 0,
        criticalDamage: 0,
        recHP: 0,
        recMP: 0
      });
    }
    setAttackTotal(0);
    if (char.id === selectedChar?.id) {
      setSelectedChar(null);
      setAttackTotal(0);
      setLevel('');
    } else {
      setSelectedChar(char);
    }
  };

  const handleAtkTotalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setAttackTotal(Number(value));
    }
  };

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevel(event.target.value);
  };

  const handleRegister = async () => {
    setLoading(true);
    if (!session?.user.uid) {
      showSnackbar('Usuário não autenticado.', 'error', {
        vertical: 'top',
        horizontal: 'center'
      });
      return;
    }

    if (selectedChar) {
      const data = {
        charId: selectedChar.id,
        atkTotal: Number(attackTotal),
        level: parseInt(level, 10),
        stats: charStats,
        isVisibleInRanking
      };

      try {
        await RegisterUserCharacter(session.user.uid, selectedChar.id, data);
        fetchUserCharsData(session.user.uid);
        showSnackbar('Personagem registrado com sucesso!', 'success', {
          vertical: 'top',
          horizontal: 'center'
        });

        setSelectedChar(null);
        setAttackTotal(0);
        setLevel('');
      } catch (err) {
        showSnackbar(err.message, 'error', {
          vertical: 'top',
          horizontal: 'center'
        });
      } finally {
        setLoading(false);
      }
    } else {
      showSnackbar('Nenhum personagem selecionado.', 'warning', {
        vertical: 'top',
        horizontal: 'center'
      });
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        padding: { xs: 1.5, sm: 2, md: 3 },
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
      <Grid container spacing={2.5} sx={{ height: '100%', alignItems: 'flex-start' }}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Fade in timeout={800}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                color: 'white',
                mb: { xs: 1, sm: 2 },
                textAlign: 'center',
                fontFamily: "faktos, Roboto",
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.5px'
              }}
            >
              Adicionar Novo Personagem
            </Typography>
          </Fade>
        </Grid>

        {/* Character Selection Grid */}
        <Grid item xs={12}>
          <Fade in timeout={1000}>
            <Card
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: alpha(blue[900], 0.9),
                borderRadius: '20px',
                boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha(blue[400], 0.1)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 32px ${alpha('#000', 0.3)}`
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))'
                }}
              >
                {allChars.map(char => (
                  <SelectableImage
                    key={char.id}
                    char={char}
                    disabled={getOwnedCharIds(char.id)}
                    isSelected={selectedChar?.id === char.id}
                    onSelect={handleSelectChar}
                  />
                ))}
              </Box>
            </Card>
          </Fade>
        </Grid>

        {/* Main Content Area */}
        <Grid container item spacing={2.5} sx={{ flex: 1, width: '100%', margin: '0 !important' }}>
          {/* Character Details Panel */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={1200}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  borderRadius: '20px',
                  bgcolor: alpha(grey[900], 0.95),
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha(grey[800], 0.2)}`,
                  boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${alpha('#000', 0.3)}`
                  }
                }}
              >
                {selectedChar ? (
                  <Stack spacing={2.5}>
                    <Typography
                      variant={isMobile ? 'h5' : 'h4'}
                      fontFamily="faktos"
                      textAlign="center"
                      sx={{
                        color: theme.palette.primary.light,
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        mb: 1
                      }}
                    >
                      {selectedChar.name}
                    </Typography>

                    <TextField
                      label="ATK Total"
                      variant="outlined"
                      type="text"
                      inputMode="numeric"
                      fullWidth
                      value={attackTotal}
                      onChange={handleAtkTotalChange}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: alpha(theme.palette.background.paper, 0.1),
                          borderRadius: '12px',
                          transition: 'all 0.2s',
                          '&:hover, &.Mui-focused': {
                            bgcolor: alpha(theme.palette.background.paper, 0.15),
                            '& fieldset': {
                              borderColor: theme.palette.primary.main,
                            }
                          }
                        }
                      }}
                    />

                    <TextField
                      label="Level"
                      variant="outlined"
                      fullWidth
                      value={level}
                      onChange={handleLevelChange}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: alpha(theme.palette.background.paper, 0.1),
                          borderRadius: '12px',
                          transition: 'all 0.2s',
                          '&:hover, &.Mui-focused': {
                            bgcolor: alpha(theme.palette.background.paper, 0.15),
                            '& fieldset': {
                              borderColor: theme.palette.primary.main,
                            }
                          }
                        }
                      }}
                    />

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Exibir no Ranking
                      </Typography>
                      <Tooltip title={isVisibleInRanking ? 'Ocultar do ranking geral' : 'Exibir no ranking geral'}>
                        <GreenSwitch
                          checked={isVisibleInRanking}
                          onChange={(e) => setIsVisibleInRanking(e.target.checked)}
                        />
                      </Tooltip>
                    </Stack>

                    <Button
                      variant="contained"
                      size={isMobile ? "medium" : "large"}
                      fullWidth
                      disabled={loading}
                      onClick={handleRegister}
                      sx={{
                        mt: 1,
                        height: { xs: 44, sm: 48 },
                        borderRadius: '12px',
                        bgcolor: blue[600],
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: blue[700],
                          transform: 'translateY(-2px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        },
                        textTransform: 'none',
                        fontSize: { xs: '0.95rem', sm: '1.1rem' },
                        fontWeight: 600,
                        boxShadow: theme.shadows[4]
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Registrar Personagem'
                      )}
                    </Button>
                  </Stack>
                ) : (
                  <Stack
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ 
                      height: '100%',
                      minHeight: { xs: 200, sm: 250 },
                      p: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.05),
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <PersonAdd sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.6) }} />
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      textAlign="center"
                    >
                      Selecione um personagem para começar
                    </Typography>
                  </Stack>
                )}
              </Card>
            </Fade>
          </Grid>

          {/* Calculator Panel - Conditional Render */}
          {selectedChar && (
            <Grid item xs={12} md={8}>
              <Fade in timeout={1400}>
                <Card
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: '20px',
                    bgcolor: alpha(grey[900], 0.95),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha(grey[800], 0.2)}`,
                    boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 8px 32px ${alpha('#000', 0.3)}`
                    }
                  }}
                >
                  {/* Info Message */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.info.main, 0.15),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <InfoOutlined 
                        color="info" 
                        sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} 
                      />
                      <Typography 
                        variant={isMobile ? 'body2' : 'body1'}
                        color="info.light"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        Preencha os dados para cálculos mais precisos
                      </Typography>
                    </Stack>
                  </Box>

                  <TotalAtkCalculator />
                </Card>
              </Fade>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddUserChar;
