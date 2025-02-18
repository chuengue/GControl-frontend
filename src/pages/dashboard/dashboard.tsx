import { DeleteForever, ExpandLess, ExpandMore, InfoOutlined, Pause, PlayArrow, Stop } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Card, CircularProgress, Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { blue, green } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

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
  const [expandedId, setExpandedId] = useState(null);
  const { session } = useSession();
  const { showSnackbar } = useSnackbarStore();
  const { userChars, fetchUserCharsData } = useCharStore();
  const isLarge = useMediaQuery({ maxWidth: 1366 }); // lg
  const isExtraLarge = useMediaQuery({ minWidth: 1367 }); // xl
  const theme = useTheme();
  const userId = session?.user.uid;

  useEffect(() => {
    fetchUserCharsData(userId);
    fetchMissions();
    fetchUserSessions();
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
        vertical:"top",
        horizontal: "center"
      } );
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
      await registerItemDropsInSession(
        userId,
        selectedUserSession?.userCharId ?? '',
        selectedUserSession?.missionId ?? '',
        selectedUserSession?.sessionId ?? '',
        { drops }
      );
      fetchDropRateSessionReport(selectedUserSession?.sessionId);
      showSnackbar('Drops registrados com sucesso!', 'success');
    } catch (error) {
      showSnackbar('Erro ao registrar drops', 'error');
    } finally {
      setLoadingRegisterDrops(false);
    }
  };
  const fetchUserSessions = async () => {
    setRefetchLoading(true);
    try {
      const userSessions = await getAllUserSessions(userId);
      setSessions(userSessions.results || []);
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
      if (isEditing) {
        await updateFarmSession(
          searchUserCharId?.id,
          formData.sessionId,
          selectedMission?.id,
          formData
        );
      } else {
        await createFarmSession(userId, searchUserCharId?.id, selectedMission?.id, formData);
      }
      fetchUserSessions();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCreateSession(false);
    }
  };
  const handleDeleteFarmSession = async (sessionId: string) => {
    try {
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
  const handleExpand = async sessionId => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }

    try {
      const data = await fetchDropRateSessionReport(sessionId);
      setSessionDropRate(data.results);
      setExpandedId(sessionId);
    } catch (error) {
      console.error('Erro ao buscar relatório de drop rate:', error);
    }
  };

  const fetchDropRateSessionReport = async sessionId => {
    try {
      const data = await getDropRateSessionReport(sessionId);
      return data;
    } catch (error) {
      console.error('Erro ao buscar relatório de drop rate:', error);
      throw error;
    }
  };

  return (
    <>
      <Card
        elevation={3}
        sx={{
          p: 3,
          borderRadius: '14px',
          boxShadow: 3,
          marginBottom: '20px',
          marginTop: '-20px',
          bgcolor: theme.palette.info.main
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row'
          }}
        >
          <InfoOutlined
            sx={{
              marginRight: '8px'
            }}
          />

          <Typography>
            Gerencie suas sessões de farm de maneira eficiente! Aqui você pode criar novas sessões,
            registrar o tempo gasto e tentativas, além de acompanhar missões e personagens
            utilizados. Edite e atualize suas sessões conforme necessário para manter um controle
            preciso do seu progresso.
          </Typography>
        </Stack>
      </Card>
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
          <Stack
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.37);',
              mb: '10px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center', // Centraliza o conteúdo na vertical
              justifyContent: 'flex-start', // Alinha o conteúdo ao topo
              padding: 1
            }}
          >
            {refetchLoading ? (
              <Stack alignItems="center">
                <CircularProgress />
                <Typography variant="caption">Buscando sessões...</Typography>
              </Stack>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={() => handleOpenModal()}
                sx={{
                  width: '30%',
                  bgcolor: blue[700],
                  borderRadius: '12px',
                  color: 'white',

                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                Criar Sessão
              </Button>
            )}
          </Stack>

          <Box
            sx={{
              overflowY: 'auto',
              paddingX: '20px',
              height: {lg:"60vh",xl:'72vh'}
            }}
          >
            <Grid container spacing={3}>
              {sessions?.sessions?.map(sessionItem => (
                <Grid item xs={12} key={sessionItem.sessionId}>
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
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
                      <Divider orientation="vertical" flexItem />
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
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        {isLarge && (
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

                              <Typography variant="body2" fontWeight="bold" width={"120px"}>
                                Tempo Total:
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color={green[200]}>
                                {sessionItem?.totalTimeSpent
                                  ? formatTime(sessionItem?.totalTimeSpent, 'text')
                                  : '00:00:00'}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" fontWeight="bold" >
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
                        {isExtraLarge &&(

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
                                  ml: {lg:"10px", xl:"20px"}
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
    </>
  );
};

export default FarmSessionPage;
