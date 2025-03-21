import { DeleteForever } from '@mui/icons-material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import { blue, green, orange } from '@mui/material/colors';
import React from 'react';
import { useNavigate } from 'react-router';

import { UserCharCardProps } from '../../interfaces/char';
import {
    deleteUserGameChar,
    getUserCharAtkHistoric,
    toggleAwakened,
    updateUserGameChar
} from '../../service/requests/gameChar';
import { toggleVisibility } from '../../service/requests/ranking/ranking';
import { useSession } from '../../SessionContext';
import ConfirmationModal from '../../shared/components/confirmModal/confirmModal';
import useCharStore from '../../stores/charStore';
import useProgressStore from '../../stores/progressStore';
import { useSnackbarStore } from '../../stores/snackBarStore';
import { formatNumber } from '../../utils/formatters';
import { GreenSwitch } from '../charCard/styles';

const MAX_LEVEL = 85;

function CharCardV2({ chars, onAddCharacter, details = true }: UserCharCardProps) {
  const [confirmModalIsOpen, setConfirmModalIsOpen] = React.useState(false);
  const [userCharIdSelected, setUserCharIdSelected] = React.useState<string>();
  const [charList, setCharList] = React.useState(chars);
  const [editingCharId, setEditingCharId] = React.useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = React.useState<string | null>(null);
  const [goalInput, setGoalInput] = React.useState('');
  const [levelInput, setLevelInput] = React.useState('');
  const [atkInput, setAtkInput] = React.useState('');
  const [atkHistory, setAtkHistory] = React.useState<Record<string, any[]>>({});
  const isMobile = useMediaQuery('(max-width:600px)');

  const navigate = useNavigate();
  const { session } = useSession();
  const { fetchUserCharsData, allChars } = useCharStore();
  const { characterGoals, setCharacterGoal } = useProgressStore();
  const userId = session?.user.uid || '';
  const { showSnackbar } = useSnackbarStore();

  React.useEffect(() => {
    setCharList(chars);
  }, [chars]);

  React.useEffect(() => {
    const fetchAtkHistory = async () => {
      const history: Record<string, any[]> = {};
      for (const char of chars) {
        try {
          const response = await getUserCharAtkHistoric(char.id);
          history[char.id] = response.results;
        } catch (error) {
          console.error(`Error fetching ATK history for char ${char.id}:`, error);
        }
      }
      setAtkHistory(history);
    };

    fetchAtkHistory();
  }, [chars]);

  const calculateRecentImprovements = (charId: string) => {
    const history = atkHistory[charId] || [];
    if (history.length === 0) return { atkGained: 0 };

    const currentAtk = Number(chars.find(c => c.id === charId)?.atkTotal || 0);

    // Ordena o histórico por data, mais recente primeiro
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Pega o último registro do histórico
    const lastRecord = sortedHistory[0];
    if (!lastRecord) return { atkGained: 0 };

    return {
      atkGained: currentAtk - lastRecord.atkTotal
    };
  };

  const handleDetailsClick = (UsercharId: string) => {
    navigate(`/chars/details/${userId}/${UsercharId}`);
  };

  const handleCloseModalConfirm = () => {
    setConfirmModalIsOpen(false);
  };

  const handleOpenModalConfirm = (userCharId: string) => {
    setUserCharIdSelected(userCharId);
    setConfirmModalIsOpen(true);
  };

  const handleDeleteUserChar = async () => {
    if (!session) return;
    if (userCharIdSelected)
      try {
        const data = await deleteUserGameChar(session?.user.uid, userCharIdSelected);
        showSnackbar(data.results.message, 'success');
        fetchUserCharsData(session?.user.uid);
        setCharList(prevChars => prevChars.filter(char => char.id !== userCharIdSelected));
        handleCloseModalConfirm();
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
  };

  const toggleCharVisibility = async (userCharId: string, currentState: boolean) => {
    try {
      await toggleVisibility(userCharId);
      fetchUserCharsData(userId);
      showSnackbar('Visibilidade alterada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao alternar visibilidade:', error);
      showSnackbar('Erro ao alterar visibilidade.', 'error');
    }
  };

  const handleToggleAwakened = async (userCharId: string) => {
    try {
      await toggleAwakened(userCharId);
      fetchUserCharsData(userId);
      showSnackbar('Estado de Awakening alterado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao alternar estado de Awakening:', error);
      showSnackbar('Erro ao alterar estado de Awakening.', 'error');
    }
  };

  const handleEditStats = (charId: string) => {
    const currentChar = chars.find(c => c.id === charId);
    if (!currentChar) return;

    setLevelInput(currentChar.level.toString());
    setEditingCharId(charId);
  };

  const handleEditGoal = (charId: string) => {
    const currentGoal = characterGoals[charId]?.atkGoal || 300000;
    const currentChar = chars.find(c => c.id === charId);
    if (!currentChar) return;

    setGoalInput(currentGoal.toString());
    setAtkInput(currentChar.atkTotal.toString());
    setEditingGoalId(charId);
  };

  const handleSaveStats = async () => {
    if (editingCharId) {
      const newLevel = parseInt(levelInput) || 1;
      if (newLevel < 1 || newLevel > MAX_LEVEL) {
        showSnackbar(`O nível deve estar entre 1 e ${MAX_LEVEL}`, 'error');
        return;
      }

      try {
        const currentChar = chars.find(c => c.id === editingCharId);
        if (!currentChar) return;

        await updateUserGameChar(editingCharId, userId, {
          atkTotal: Number(currentChar.atkTotal),
          level: newLevel
        });

        showSnackbar('Status atualizado com sucesso', 'success');
        fetchUserCharsData(userId);
        setEditingCharId(null);
        setLevelInput('');
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const handleSaveGoal = async () => {
    if (editingGoalId && goalInput) {
      try {
        const currentChar = chars.find(c => c.id === editingGoalId);
        if (!currentChar) return;

        // Atualiza o ATK total
        await updateUserGameChar(editingGoalId, userId, {
          atkTotal: Number(atkInput),
          level: currentChar.level
        });

        // Define a nova meta de ATK
        setCharacterGoal(editingGoalId, { atkGoal: Number(goalInput) });
        showSnackbar('ATK e meta atualizados com sucesso', 'success');
        fetchUserCharsData(userId);
        setEditingGoalId(null);
        setGoalInput('');
        setAtkInput('');
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const getLevelProgressColor = (level: number) => {
    if (level === MAX_LEVEL) return green[500];
    if (level >= MAX_LEVEL * 0.8) return orange[500];
    return blue[500];
  };

  const getAtkProgressColor = (atk: number, goal: number) => {
    if (atk >= goal) return green[500];
    const progress = (atk / goal) * 100;
    if (progress >= 80) return orange[500];
    return blue[500];
  };

  const calculateAtkProgress = (atk: number, goal: number) => {
    if (atk >= goal) return 100;
    return (atk / goal) * 100;
  };

  const calculateAwakeningStats = () => {
    const totalChars = allChars.length;
    const charsWithAwakening = allChars.filter(char => char.haveAwakening).length;
    const awakenedChars = chars.filter(
      char => char.gameChar.haveAwakening && char.isAwakened
    ).length;

    return {
      totalChars,
      charsWithAwakening,
      awakenedChars,
      awakeningPercentage: charsWithAwakening > 0 ? (awakenedChars / charsWithAwakening) * 100 : 0
    };
  };

  return (
    <Stack spacing={3} width="100%">
      {/* Awakening Stats Section */}
      {details && chars.some(char => char.gameChar.haveAwakening) && (
        <Card
          elevation={3}
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: isMobile ? '100%' : '300px'
            }}
          >
            <img
              src="/assets/images/despertar_icon.webp"
              alt="Despertar"
              style={{
                width: '48px',
                height: '48px',
                opacity: 0.8
              }}
            />
            <Box>
              <Typography variant="h6" color="white" gutterBottom>
                Estatísticas de Despertar
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                {calculateAwakeningStats().charsWithAwakening} de{' '}
                {calculateAwakeningStats().totalChars} personagens podem despertar
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="white">
                Progresso do Despertar
              </Typography>
              <Typography variant="body2" color="white">
                {calculateAwakeningStats().awakenedChars} /{' '}
                {calculateAwakeningStats().charsWithAwakening}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateAwakeningStats().awakeningPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: blue[700],
                '& .MuiLinearProgress-bar': {
                  bgcolor:
                    calculateAwakeningStats().awakeningPercentage === 100 ? green[500] : blue[500]
                }
              }}
            />
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
              {calculateAwakeningStats().awakeningPercentage.toFixed(1)}% dos personagens
              despertados
            </Typography>
          </Box>
        </Card>
      )}
      {charList.map(char => {
        const progress = characterGoals[char.id] || {
          atkGoal: 300000,
          recentImprovements: {
            levelGained: 0,
            atkGained: 0,
            date: new Date().toISOString()
          }
        };
        const levelProgress = (char.level / MAX_LEVEL) * 100;
        const atkProgress = (Number(char.atkTotal) / progress.atkGoal) * 100;

        return (
          <Card
            key={char.id}
            elevation={3}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
              }
            }}
          >
            {/* Character Image Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 1,
                minWidth: isMobile ? '100%' : '150px',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <img
                  src={char.gameChar.thumbImgUrl || char.gameChar.defaultImgUrl}
                  alt={char.gameChar.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                {char.level && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {char.level}
                  </Box>
                )}
              </Box>
              <Typography
                variant="subtitle1"
                fontFamily={'faktos'}
                color="white"
                sx={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontWeight: 'bold',
                  textAlign: isMobile ? 'center' : 'left'
                }}
              >
                {char.gameChar.name}
              </Typography>
            </Box>

            <Divider
              orientation={isMobile ? 'horizontal' : 'vertical'}
              flexItem
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                my: isMobile ? 2 : 0,
                height: isMobile ? '1px' : 'auto'
              }}
            />

            {/* Stats and Controls Section */}
            {details && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  gap: isMobile ? 2 : 3,
                  flex: 1,
                  width: '100%'
                }}
              >
                <Box sx={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    mb={1}
                    sx={{
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      flexWrap: isMobile ? 'wrap' : 'nowrap'
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="white"
                        sx={{
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Progresso de Nível
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        {char.level}/{MAX_LEVEL}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditStats(char.id)}
                      sx={{
                        color: 'white',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(15deg)',
                          color: '#90caf9'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {char.level === MAX_LEVEL && (
                      <EmojiEventsIcon
                        sx={{
                          color: '#ffd700',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          animation: 'pulse 2s infinite'
                        }}
                      />
                    )}
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={levelProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getLevelProgressColor(char.level),
                        transition: 'all 0.3s ease',
                        borderRadius: 4
                      }
                    }}
                  />

                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    mb={1} 
                    mt={3}
                    sx={{
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '8px 12px',
                      borderRadius: '8px'
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="white"
                        sx={{
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Ataque Total
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        {formatNumber(Number(char.atkTotal))} / {formatNumber(progress.atkGoal)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditGoal(char.id)}
                      sx={{
                        color: 'white',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(15deg)',
                          color: '#90caf9'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateAtkProgress(Number(char.atkTotal), progress.atkGoal)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getAtkProgressColor(Number(char.atkTotal), progress.atkGoal),
                        transition: 'all 0.3s ease',
                        borderRadius: 4
                      }
                    }}
                  />

                  {progress.recentImprovements && (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mt={2}
                      sx={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: 1,
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <TrendingUpIcon
                        sx={{
                          color:
                            calculateRecentImprovements(char.id).atkGained >= 0
                              ? '#4caf50'
                              : '#ff9800',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                        }}
                      />
                      <Typography variant="body2" color="white" sx={{ fontWeight: 'medium' }}>
                        +{progress.recentImprovements.levelGained} levels {'  '}
                        {calculateRecentImprovements(char.id).atkGained >= 0 ? '+' : ''}
                        {formatNumber(calculateRecentImprovements(char.id).atkGained)} ATK
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider
                  orientation={isMobile ? 'horizontal' : 'vertical'}
                  flexItem
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    my: isMobile ? 2 : 0,
                    height: isMobile ? '1px' : 'auto'
                  }}
                />

                <Stack 
                  direction={isMobile ? 'row' : 'column'} 
                  spacing={2} 
                  alignItems={isMobile ? 'center' : 'center'}
                  justifyContent={isMobile ? 'center' : 'flex-start'}
                  sx={{ 
                    width: isMobile ? '100%' : 'auto',
                    mt: isMobile ? 2 : 0 
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      background: 'rgba(255,255,255,0.1)',
                      padding: 1,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      width: isMobile ? '50%' : 'auto'
                    }}
                  >
                    <Tooltip
                      title={
                        char.isVisibleInRanking
                          ? 'Ocultar do ranking global'
                          : 'Mostrar no ranking global'
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                          src="/assets/images/ranking_icon.png"
                          alt="Ranking"
                          style={{
                            width: '24px',
                            height: '24px',
                            opacity: char.isVisibleInRanking ? 1 : 0.5,
                            transition: 'all 0.2s ease-in-out'
                          }}
                        />
                        <GreenSwitch
                          onChange={() => toggleCharVisibility(char.id, char.isVisibleInRanking)}
                          checked={char.isVisibleInRanking ?? false}
                        />
                      </Box>
                    </Tooltip>
                  </Box>

                  {!!char.gameChar.haveAwakening && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: 'rgba(255,255,255,0.1)',
                        padding: 1,
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <Tooltip title={char.isAwakened ? 'Desativar Despertar' : 'Ativar Despertar'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img
                            src="/assets/images/despertar_icon.webp"
                            alt="Awakening"
                            style={{
                              width: '24px',
                              height: '24px',
                              opacity: char.isAwakened ? 1 : 0.5,
                              transition: 'all 0.2s ease-in-out'
                            }}
                          />
                          <GreenSwitch
                            onChange={() => handleToggleAwakened(char.id)}
                            checked={char.isAwakened}
                          />
                        </Box>
                      </Tooltip>
                    </Box>
                  )}
                </Stack>

                <Divider
                  orientation={isMobile ? 'horizontal' : 'vertical'}
                  flexItem
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    my: isMobile ? 2 : 0,
                    height: isMobile ? '1px' : 'auto'
                  }}
                />

                <Stack 
                  direction={isMobile ? 'row' : 'column'} 
                  spacing={1}
                  sx={{
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    mt: isMobile ? 2 : 0
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleDetailsClick(char.id)}
                    sx={{
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease-in-out',
                      width: isMobile ? '48px' : '40px',
                      height: isMobile ? '48px' : '40px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                      }
                    }}
                  >
                    <AddCircleRoundedIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenModalConfirm(char.id)}
                    sx={{
                      background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease-in-out',
                      width: isMobile ? '48px' : '40px',
                      height: isMobile ? '48px' : '40px',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)'
                      }
                    }}
                  >
                    <DeleteForever />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Card>
        );
      })}

      <ConfirmationModal
        open={confirmModalIsOpen}
        title="Excluir Personagem"
        message="Tem certeza que deseja excluir este personagem?"
        onClose={handleCloseModalConfirm}
        onConfirm={() => handleDeleteUserChar()}
      />

      {/* Stats Update Dialog */}
      <Dialog
        open={!!editingCharId}
        onClose={() => setEditingCharId(null)}
        PaperProps={{
          sx: {
            bgcolor: blue[900],
            color: 'white',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle>Atualizar Status do Personagem</DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Atualizar Nível
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
              Atualize o nível do personagem. O ATK total será mantido.
            </Typography>
            <TextField
              margin="dense"
              label="Nível Atual"
              type="number"
              fullWidth
              value={levelInput}
              onChange={e => setLevelInput(e.target.value)}
              inputProps={{ min: 1, max: MAX_LEVEL }}
              helperText={`Nível deve estar entre 1 e ${MAX_LEVEL}`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: 'white'
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCharId(null)} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveStats}
            sx={{
              color: 'white',
              bgcolor: blue[600],
              '&:hover': {
                bgcolor: blue[700]
              }
            }}
          >
            Salvar Nível
          </Button>
        </DialogActions>
      </Dialog>

      {/* Goal Setting Dialog */}
      <Dialog
        open={!!editingGoalId}
        onClose={() => setEditingGoalId(null)}
        PaperProps={{
          sx: {
            bgcolor: blue[900],
            color: 'white',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle>Atualizar Ataque e Meta</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Ataque Total
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
              Atualize o ATK total do personagem.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="ATK Total"
              type="number"
              fullWidth
              value={atkInput}
              onChange={e => setAtkInput(e.target.value)}
              helperText="Este valor representa o poder de ataque atual do personagem"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: 'white'
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Meta de Ataque
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
              Defina a meta de ATK que você deseja alcançar com este personagem.
            </Typography>
            <TextField
              margin="dense"
              label="Meta de Ataque"
              type="number"
              fullWidth
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              helperText="Esta meta será usada para calcular o progresso do personagem"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: 'white'
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingGoalId(null)} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveGoal}
            sx={{
              color: 'white',
              bgcolor: blue[600],
              '&:hover': {
                bgcolor: blue[700]
              }
            }}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default CharCardV2;
