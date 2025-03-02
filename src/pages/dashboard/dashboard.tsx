import { DeleteForever, ExpandLess, ExpandMore, InfoOutlined, Pause, PlayArrow, Stop } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, Button, Card, CircularProgress, Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { blue, green, grey } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router';

import { registerItemDropsInSession } from '../../service/requests/items';
import { createFarmSession, deleteFarmSession, getAllMissions, getAllUserSessions, getDropRateSessionReport, updateFarmSession } from '../../service/requests/missions/missions';
import { FarmSessionsResponse } from '../../service/requests/missions/type';
import { DropItem, DropRateReport } from '../../service/requests/types';
import { useSession } from '../../SessionContext';
import { CardCustom } from '../../shared/components/cardCustom/cardCustom';
import ConfirmationModal from '../../shared/components/confirmModal/confirmModal';
import { Character, Mission, Session } from '../../shared/types';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';
import CreateSessionModal from './components/createSessionModal/createSessionModal';
import DropRateStats from './components/dropRateStats/dropRateStats';
import DropItemsModal from './components/registerDropsModal/registerDropsModal';

export interface IFormData {
  sessionId: string;
  timeSpent: string;
  name: string | null;
  attempts: number;
}

const FarmSessionPage = () => {
  const [dropItemsModalOpen, setDropItemsModalOpen] = useState(false);
  const [sessionDropRate, setSessionDropRate] = useState<DropRateReport['results']>();
  const [sessions, setSessions] = useState<FarmSessionsResponse['results']>();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>();
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<IFormData>();
  const [loadingRegisterDrops, setLoadingRegisterDrops] = useState(false);
  const [timers, setTimers] = useState<{
    [key: string]: { isRunning: boolean; elapsedTime: number; startTime: number | null };
  }>({});

  const [loadingCreateSession, setLoadingCreateSession] = useState(false);
  const [refetchLoading, setRefetchLoading] = useState(false);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [selectedUserSession, setSelectedUserSession] = useState<Session>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { session } = useSession();
  const { showSnackbar } = useSnackbarStore();
  const { userChars, fetchUserCharsData } = useCharStore();
  const isLarge = useMediaQuery({ maxWidth: 1366 }); // lg
  const isExtraLarge = useMediaQuery({ minWidth: 1367 }); // xl
  const isMobile = useMediaQuery({ minWidth: 500 });
  const theme = useTheme();
  const userId = session?.user.uid;
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchUserCharsData(userId);
      fetchMissions();
      fetchUserSessions();
    }
  }, [userId]);

  const startTimer = (session: Session) => {
    setTimers(prevTimers => ({
      ...prevTimers,
      [session.sessionId]: {
        isRunning: true,
        elapsedTime: session.totalTimeSpent,
        startTime: Date.now() - session.totalTimeSpent * 1000
      }
    }));
  };

  const pauseTimer = async (session: Session) => {
    setTimers(prevTimers => {
      const currentTimer = prevTimers[session.sessionId];
      if (!currentTimer?.isRunning) return prevTimers;

      const newElapsedTime = Math.floor((Date.now() - (currentTimer.startTime || 0)) / 1000);

      return {
        ...prevTimers,
        [session.sessionId]: {
          isRunning: false,
          elapsedTime: newElapsedTime,
          startTime: null
        }
      };
    });

    // Atualizar no backend
    try {
      await updateFarmSession(session.userCharId, session.sessionId, session.missionId, {
        timeSpent: formatTime(timers[session.sessionId]?.elapsedTime || 0, 'dots')
      });
      showSnackbar('Timer Pausado!', 'success', {
        vertical: 'top',
        horizontal: 'center'
      });
    } catch (error) {
      console.error('Erro ao atualizar o tempo:', error);
      showSnackbar('Erro ao atualizar o tempo', 'error');
    }
  };

  const resetTimer = async (session: Session) => {
    setTimers(prevTimers => ({
      ...prevTimers,
      [session.sessionId]: {
        isRunning: false,
        elapsedTime: 0,
        startTime: null
      }
    }));

    // Atualizar no backend
    try {
      await updateFarmSession(session.userCharId, session.sessionId, session.missionId, {
        timeSpent: formatTime(0, 'dots')
      });
      showSnackbar('Timer resetado com sucesso!', 'success');
    } catch (error) {
      showSnackbar('Erro ao resetar o timer', 'error');
    }
  };
  useEffect(() => {
    const intervals: { [key: string]: any } = {};

    Object.keys(timers).forEach(sessionId => {
      const sessionTimer = timers[sessionId];

      if (sessionTimer.isRunning) {
        intervals[sessionId] = setInterval(() => {
          const currentTime = Date.now();
          const newElapsedTime = Math.floor((currentTime - (sessionTimer.startTime || 0)) / 1000);

          setTimers(prevTimers => ({
            ...prevTimers,
            [sessionId]: {
              ...prevTimers[sessionId],
              elapsedTime: newElapsedTime
            }
          }));

          // Atualiza o estado local das sessões em tempo real
          setSessions(prevSessions => ({
            ...prevSessions,
            sessions: prevSessions.sessions.map(s =>
              s.sessionId === sessionId
                ? {
                    ...s,
                    totalTimeSpent: newElapsedTime,
                    avgTimePerAttempt: newElapsedTime / s.attempts
                  }
                : s
            )
          }));
        }, 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [timers]);

  function formatTime(totalTimeInSeconds: number, variant: 'text' | 'dots') {
    const time = Math.floor(totalTimeInSeconds);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    if (variant === 'text') {
      return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', seconds ? `${seconds}s` : '']
        .filter(Boolean)
        .join(' ');
    } else {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }
  const registerDrops = async (drops: DropItem[]) => {
    setLoadingRegisterDrops(true);
    try {
      if (userId && selectedUserSession) {
        await registerItemDropsInSession(
          userId,
          selectedUserSession.userCharId,
          selectedUserSession.missionId,
          selectedUserSession.sessionId,
          { drops }
        );
        fetchDropRateSessionReport(selectedUserSession.sessionId);
        showSnackbar('Drops registrados com sucesso!', 'success');
      }
    } catch (error) {
      showSnackbar('Erro ao registrar drops', 'error');
    } finally {
      setLoadingRegisterDrops(false);
    }
  };
  const fetchUserSessions = async () => {
    setRefetchLoading(true);
    try {
      if (userId) {
        const userSessions = await getAllUserSessions(userId);
        setSessions(userSessions.results);
      }
    } catch (error) {
      showSnackbar(error.message || 'Erro ao buscar sessões, Tente novamente.', 'error');
    } finally {
      setRefetchLoading(false);
    }
  };

  const fetchMissions = async () => {
    try {
      const data = await getAllMissions();
      setMissions(data.results || []);
    } catch (error) {
      showSnackbar(error.message || 'Erro ao buscar missões, Tente novamente.', 'error');
    }
  };
  const handleOpenDropItemsModal = (session: Session) => {
    setSelectedUserSession(session);
    setDropItemsModalOpen(true);
  };
  const handleOpenModal = (session?: Session) => {
    if (session && timers[session.sessionId]?.isRunning) pauseTimer(session);
    setSelectedUserSession(session);
    setIsEditing(!!session);
    setFormData(
      session
        ? {
            sessionId: session.sessionId,
            timeSpent: formatTime(session.totalTimeSpent, 'dots'),
            name: session.name,
            attempts: session.attempts
          }
        : { sessionId: '', timeSpent: '', attempts: 0, name: '' }
    );
    setOpenModal(true);
    if (session) {
      setSelectedMission(session?.mission || null);
      setSelectedCharacter(session?.character);
    }
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleSaveSession = async () => {
    setLoadingCreateSession(true);
    const searchUserCharId = userChars.find(ch => ch.gameChar.id === selectedCharacter?.id);
    try {
      if (isEditing && formData) {
        await updateFarmSession(
          searchUserCharId?.id || '',
          formData.sessionId,
          selectedMission?.id || '',
          {
            attempts: formData.attempts,
            timeSpent: formData.timeSpent,
            name: formData.name || ''
          }
        );
      } else if (formData) {
        await createFarmSession(
          userId || '', 
          searchUserCharId?.id || '', 
          selectedMission?.id || '', 
          {
            attempts: formData.attempts,
            timeSpent: formData.timeSpent,
            name: formData.name || ''
          }
        );
      }
      fetchUserSessions();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCreateSession(false);
    }
  };
  const handleDeleteFarmSession = async (sessionId: string | undefined) => {
    try {
      if (!sessionId) {
        throw new Error('ID da sessão é obrigatório');
      }
      await deleteFarmSession(sessionId);
      fetchUserSessions();
      showSnackbar('Sessão excluída com sucesso', 'success', {
        vertical: 'top',
        horizontal: 'center'
      });
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      showSnackbar('Erro ao tentar Excluir Sessão', 'error', {
        vertical: 'top',
        horizontal: 'center'
      });
    } finally {
      setConfirmModalIsOpen(false);
    }
  };

  const handleCloseModalConfirm = () => {
    setConfirmModalIsOpen(false);
  };

  const handleOpenModalConfirm = (session: Session) => {
    setSelectedUserSession(session);
    setConfirmModalIsOpen(true);
  };
  const handleExpand = async (sessionId: string) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }

    try {
      const data = await fetchDropRateSessionReport(sessionId);
      setExpandedId(sessionId);
    } catch (error) {
      console.error('Erro ao buscar relatório de drop rate:', error);
    }
  };

  const fetchDropRateSessionReport = async (sessionId: string) => {
    try {
      if (!sessionId) {
        throw new Error('ID da sessão é obrigatório');
      }
      const data = await getDropRateSessionReport(sessionId);
      setSessionDropRate(data.results);
      return data;
    } catch (error) {
      console.error('Erro ao buscar relatório de drop rate:', error);
      throw error;
    }
  };

  return (
    <Box>
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: '12px',
          mb: 2,
          '& .MuiAlert-icon': {
            color: theme.palette.info.main
          }
        }}
      >
        Gerencie suas sessões de farm de maneira eficiente! Aqui você pode criar novas sessões,
        registrar o tempo gasto e tentativas, além de acompanhar missões e personagens
        utilizados. Edite e atualize suas sessões conforme necessário para manter um controle
        preciso do seu progresso.
      </Alert>
     
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: { lg: '100%', xl: '80%' }
          }}
        >
          
          {userChars && userChars.length > 0 && sessions?.sessions && sessions.sessions.length > 0 && (
            <Stack
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.37)',
                mb: '10px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 2
              }}
            >
              {refetchLoading ? (
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress size={40} />
                  <Typography variant="body2">Buscando sessões...</Typography>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleOpenModal()}
                  sx={{
                    width: { xs: "90%", sm: "60%", md: "40%", lg: "30%" },
                    bgcolor: blue[700],
                    borderRadius: '12px',
                    color: 'white',
                    py: 1.5,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  Criar Nova Sessão
                </Button>
              )}
            </Stack>
          )}
          
          <Box>
            <Grid container spacing={3}>
              {userChars && userChars.length <= 0 && (
                <Box
                  sx={{
                    height: '70vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    textAlign: 'center',
                    gap: 3,
                    p: 4,
                    borderRadius: '16px',
                  }}
                >
                  <img 
                    src="/assets/images/empty_state.svg"
                    alt="No characters" 
                    style={{ 
                      width: '250px', 
                      height: 'auto',
                      opacity: 0.8,
                      marginBottom: '16px'
                    }} 
                  />
                  <Box sx={{ maxWidth: '600px' }}>
                    <Typography 
                      variant="h4" 
                      color="primary"
                      sx={{ 
                        mb: 2,
                        fontWeight: 'bold'
                      }}
                    >
                      Bem-vindo ao Controle de Farm!
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="textSecondary" 
                      sx={{ 
                        mb: 3,
                        lineHeight: 1.6
                      }}
                    >
                      Para começar a criar sessões e acompanhar seu progresso, você precisa primeiro cadastrar um personagem.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/chars/add-user-char')}
                      sx={{
                        mt: 2,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4,
                        color: 'white',
                        bgcolor: blue[700],
                        '&:hover': {
                          bgcolor: blue[600],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s'
                        }
                      }}
                    >
                      Cadastrar Meu Primeiro Personagem
                    </Button>
                  </Box>
                </Box>
              )}

              {(!sessions?.sessions || sessions.sessions.length === 0) && userChars.length > 0 && (
                <Box
                  sx={{
                    minHeight: '80vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 2, sm: 4 }
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '24px',
                      p: { xs: 3, sm: 5 },
                      maxWidth: '500px',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <Box
                      sx={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <img 
                        src="/assets/images/empty_state.svg"
                        alt="No sessions" 
                        style={{ 
                          width: '50px',
                          height: 'auto',
                          opacity: 0.8
                        }} 
                      />
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      color="primary" 
                      align="center"
                      sx={{
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                      }}
                    >
                      Comece Sua Jornada
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        maxWidth: '400px',
                        lineHeight: 1.6
                      }}
                    >
                      Crie sua primeira sessão de farm para começar a acompanhar seu progresso e registrar suas conquistas!
                    </Typography>

                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleOpenModal()}
                      sx={{
                        mt: 2,
                        bgcolor: blue[600],
                        borderRadius: '12px',
                        color: 'white',
                        py: 1.5,
                        px: 4,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: blue[500],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        }
                      }}
                    >
                      Criar Primeira Sessão
                    </Button>
                  </Box>
                </Box>
              )}

              {sessions?.sessions?.map(sessionItem => (
                <Grid
                  item
                  xs={12}
                  key={sessionItem.sessionId}
                  sx={{
                    width: { xs: '90vw', md: 'auto' }
                  }}
                >
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', lg: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: blue[800],
                      borderRadius: 6,
                      padding: 2,
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                      minHeight: '153px',
                      boxShadow: theme.shadows[3],
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexGrow: 1
                      }}
                      onClick={() => handleExpand(sessionItem.sessionId)}
                    >
                      <Stack
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                          width: { lg: '100px', xl: '130px' }
                        }}
                      >
                        {sessionItem.mission && (
                          <img
                            src={sessionItem.mission.imgUrl}
                            alt={sessionItem.mission.name}
                            width="70px"
                            height="70px"
                          />
                        )}
                        <Typography variant="caption" textAlign="center">
                          {sessionItem.mission.name}
                        </Typography>
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Stack
                        sx={{
                          marginLeft: '10px',
                          marginRight: '10px'
                        }}
                      >
                        {sessionItem.character && (
                          <img
                            src={sessionItem.character.thumbImgUrl}
                            alt={sessionItem.character.name}
                          />
                        )}
                      </Stack>
                      {isMobile && <Divider orientation="vertical" flexItem />}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        px: 2
                      }}
                    >
                      <Stack
                        id="infos"
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        {!isMobile && (
                        <Stack sx={{
                          flexDirection:"row",
                          gap: '10px'
                        }}>

                          <CardCustom>
                            <Stack
                              spacing={1}
                              sx={{
                                flex: 1,
                                textAlign: 'center'
                              }}
                            >
                              <Typography variant="body1" fontWeight="bold">
                                Idas: {sessionItem.attempts}
                              </Typography>
                              <Divider sx={{ my: 1 }} />

                              <Typography variant="body2" fontWeight="bold" width={'120px'}>
                                Tempo Total:
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {sessionItem?.totalTimeSpent
                                  ? formatTime(sessionItem?.totalTimeSpent, 'text')
                                  : '00:00:00'}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" fontWeight="bold">
                                T. Médio/Ida
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {sessionItem.avgTimePerAttempt
                                  ? formatTime(sessionItem?.avgTimePerAttempt, 'text')
                                  : '00:00:00'}
                              </Typography>
                            </Stack>
                          </CardCustom>
                          <CardCustom>
                          <Stack direction="column">
                            <Tooltip title="Iniciar Sessão" placement="top-start">
                              <IconButton
                                onClick={() => startTimer(sessionItem)}
                                disabled={timers[sessionItem.sessionId]?.isRunning}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Pausar Sessão" placement="top-start">
                              <IconButton
                                onClick={() => pauseTimer(sessionItem)}
                                disabled={!timers[sessionItem.sessionId]?.isRunning}
                              >
                                <Pause />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Resetar Timer da Sessão" placement="top-start">
                              <IconButton
                                onClick={() => resetTimer(sessionItem)}
                                disabled={!timers[sessionItem.sessionId]?.elapsedTime}
                              >
                                <Stop />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardCustom>
                        </Stack>
                        )}
                        {isLarge && isMobile && (
                          <CardCustom>
                            <Stack
                              spacing={1}
                              sx={{
                                flex: 1,
                                textAlign: 'center'
                              }}
                            >
                              <Typography variant="body1" fontWeight="bold">
                                Idas: {sessionItem.attempts}
                              </Typography>
                              <Divider sx={{ my: 1 }} />

                              <Typography variant="body2" fontWeight="bold" width={'120px'}>
                                Tempo Total:
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {sessionItem?.totalTimeSpent
                                  ? formatTime(sessionItem?.totalTimeSpent, 'text')
                                  : '00:00:00'}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" fontWeight="bold">
                                T. Médio/Ida
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {sessionItem.avgTimePerAttempt
                                  ? formatTime(sessionItem?.avgTimePerAttempt, 'text')
                                  : '00:00:00'}
                              </Typography>
                            </Stack>
                          </CardCustom>
                        )}
                        {isExtraLarge && (
                          <CardCustom>
                            <Stack
                              direction="row"
                              spacing={{ lg: 1, xl: 2 }}
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              {/* Idas */}
                              <Stack spacing={1} alignItems="center">
                                <Typography variant="body2">Idas</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                  {sessionItem.attempts}
                                </Typography>
                              </Stack>
                              <Divider orientation="vertical" flexItem />
                              {/* Tempo Total e Tempo Médio */}
                              <Stack
                                spacing={1}
                                sx={{
                                  flex: 1,
                                  textAlign: 'center'
                                }}
                              >
                                <Typography variant="body2">Tempo Total</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                  {sessionItem?.totalTimeSpent
                                    ? formatTime(sessionItem?.totalTimeSpent, 'text')
                                    : '00:00:00'}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2">Tempo Médio por Ida</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                  {sessionItem.avgTimePerAttempt
                                    ? formatTime(sessionItem?.avgTimePerAttempt, 'text')
                                    : '00:00:00'}
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardCustom>
                        )}
                        {isMobile && (

                        <CardCustom>
                          <Stack direction="column">
                            <Tooltip title="Iniciar Sessão" placement="top-start">
                              <IconButton
                                onClick={() => startTimer(sessionItem)}
                                disabled={timers[sessionItem.sessionId]?.isRunning}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Pausar Sessão" placement="top-start">
                              <IconButton
                                onClick={() => pauseTimer(sessionItem)}
                                disabled={!timers[sessionItem.sessionId]?.isRunning}
                              >
                                <Pause />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Resetar Timer da Sessão" placement="top-start">
                              <IconButton
                                onClick={() => resetTimer(sessionItem)}
                                disabled={!timers[sessionItem.sessionId]?.elapsedTime}
                              >
                                <Stop />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardCustom>
                        )}
  
                        {isLarge && (
                          <CardCustom>
                            <Stack spacing={1} sx={{ textAlign: 'center' }}>
                              {/* Criado em */}
                              <Typography variant="body2">Criado em</Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {new Date(sessionItem?.created_at).toLocaleDateString('pt-BR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </Typography>

                              <Divider sx={{ my: 1 }} />

                              <Typography variant="body2">Última Modificação</Typography>
                              <Typography variant="body2" fontWeight="bold" color={green[200]}>
                                {new Date(sessionItem?.updated_at).toLocaleString('pt-BR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </Typography>
                            </Stack>
                          </CardCustom>
                        )}
                        {isExtraLarge && (
                          <CardCustom>
                            <Stack spacing={1} sx={{ textAlign: 'center' }}>
                              {/* Criado em */}
                              <Typography variant="body2">Criado em</Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {new Date(sessionItem?.created_at).toLocaleDateString('pt-BR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </Typography>

                              <Divider sx={{ my: 1 }} />

                              <Typography variant="body2">Última Modificação</Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {new Date(sessionItem?.updated_at).toLocaleString('pt-BR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </Typography>
                            </Stack>
                          </CardCustom>
                        )}
                        <Box>
                          <Tooltip
                            title="Você ainda não registrou nenhuma ida."
                            placement="top-start"
                            arrow
                            disableHoverListener={sessionItem.attempts !== 0} // Só exibe se attempts for 0
                          >
                            <Box>
                              <Button
                                disabled={sessionItem.attempts === 0}
                                variant="contained"
                                onClick={() => handleOpenDropItemsModal(sessionItem)}
                                sx={{
                                  maxWidth: 120,
                                  padding: 2,
                                  borderRadius: '12px',
                                  color: 'white',
                                  bgcolor: blue[600],
                                  ml: { lg: '10px', xl: '20px' }
                                }}
                              >
                                Registrar Drops
                              </Button>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        onClick={() => handleOpenModal(sessionItem)}
                        sx={{ color: 'white' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenModalConfirm(sessionItem)}
                        sx={{ color: 'white' }}
                      >
                        <DeleteForever />
                      </IconButton>
                      <Tooltip
                        title="Você ainda não registrou nenhuma ida."
                        placement="top-start"
                        arrow
                        disableHoverListener={sessionItem.attempts !== 0}
                      >
                        <IconButton
                          onClick={() => handleExpand(sessionItem.sessionId)}
                          disabled={sessionItem.attempts === 0}
                          sx={{ color: 'white' }}
                        >
                          {expandedId === sessionItem.sessionId ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                  {sessionDropRate && (
                    <DropRateStats
                      expandedId={expandedId}
                      sessionItemId={sessionItem.sessionId}
                      sessionDropRate={sessionDropRate}
                      formatTime={formatTime}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
            <CreateSessionModal
              openModal={openModal}
              isLoading={loadingCreateSession}
              handleCloseModal={handleCloseModal}
              isEditing={isEditing}
              formData={formData}
              handleSaveSession={handleSaveSession}
              missions={missions}
              userChars={userChars}
              selectedCharacter={selectedCharacter}
              selectedMission={selectedMission}
              setFormData={setFormData}
              setSelectedMission={setSelectedMission}
              setSelectedCharacter={setSelectedCharacter}
            ></CreateSessionModal>
            <ConfirmationModal
              open={confirmModalIsOpen}
              title="Excluir Sessão"
              message="Tem certeza que deseja excluir esta sessão?"
              onClose={handleCloseModalConfirm}
              onConfirm={() => handleDeleteFarmSession(selectedUserSession?.sessionId)}
            ></ConfirmationModal>
            <DropItemsModal
              open={dropItemsModalOpen}
              onClose={() => setDropItemsModalOpen(false)}
              isLoading={loadingRegisterDrops}
              onSave={drops => {
                registerDrops(drops);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FarmSessionPage;
