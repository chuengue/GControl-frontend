import { DeleteForever, ExpandLess, ExpandMore, InfoOutlined, Pause, PlayArrow, Stop } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Card, Collapse, Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { blue, green, grey } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';

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
import DropItemsModal from './components/registerDropsModal/registerDropsModal';

export interface IFormData {
  sessionId: string;
  timeSpent: string;
  name: string | null;
  attempts: number;
}

const DashboardPage = () => {
  const [dropItemsModalOpen, setDropItemsModalOpen] = useState(false);
  const [sessionDropRate, setSessionDropRate] = useState<DropRateReport['results']>();
  const [sessions, setSessions] = useState<FarmSessionsResponse['results']>();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>();
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<IFormData>();
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [selectedUserSession, setSelectedUserSession] = useState<Session>();
  const [expandedId, setExpandedId] = useState(null);
  const { session } = useSession();
  const { showSnackbar } = useSnackbarStore();
  const { userChars, fetchUserCharsData } = useCharStore();
  const [isRunning, setIsRunning] = useState(false); // Estado para controlar se o cronômetro está ativo
  const [elapsedTime, setElapsedTime] = useState(0); // Tempo decorrido em segundos
  const [startTime, setStartTime] = useState<number | null>(null); // Tempo inicial do cronômetro
  const theme = useTheme();
  const userId = session?.user.uid;
  useEffect(() => {
    fetchUserCharsData(userId);
    fetchMissions();
  }, [userId]);

  const startTimer = (session: Session) => {
    if (!isRunning) {
      setElapsedTime(session.totalTimeSpent); // Inicializa o elapsedTime com o totalTimeSpent da sessão
      setSelectedUserSession(session);
      setIsRunning(true);
      setStartTime(Date.now() - session.totalTimeSpent * 1000); // Ajusta o tempo inicial para continuar de onde parou
    }
  };

  const pauseTimer = async (session: Session) => {
    setSelectedUserSession(session);

    if (isRunning) {
      setIsRunning(false);

      // Atualiza o tempo decorrido
      const currentTime = Date.now();
      const newElapsedTime = Math.floor((currentTime - (startTime || 0)) / 1000);
      setElapsedTime(newElapsedTime);

      // Faz o update do timeSpent no backend
      if (selectedUserSession) {
        const newTime = newElapsedTime;

        try {
          // Atualiza o tempo no backend
          await updateFarmSession(
            selectedUserSession.userCharId,
            selectedUserSession.sessionId,
            selectedUserSession.missionId,
            { timeSpent: formatTime(newTime, 'dots') }
          );

          // Atualiza o estado local das sessões
          if (sessions && sessions.sessions) {
            const updatedSessions = sessions.sessions.map(s => {
              if (s.sessionId === session.sessionId) {
                return {
                  ...s,
                  totalTimeSpent: newTime,
                  avgTimePerAttempt: newTime / s.attempts // Atualiza o totalTimeSpent
                };
              }
              return s;
            });

            // Atualiza o estado das sessões
            setSessions(prevSessions => ({
              ...prevSessions,
              sessions: updatedSessions
            }));
          }

          showSnackbar('Tempo atualizado com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao atualizar o tempo:', error);
          showSnackbar('Erro ao atualizar o tempo', 'error');
        }
      }
    }
  };

  const resetTimer = async (session: Session) => {
    setSelectedUserSession(session);

    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);

    // Atualiza o tempo no backend para 0
    try {
      await updateFarmSession(session.userCharId, session.sessionId, session.missionId, {
        timeSpent: formatTime(0, 'dots')
      });

      // Atualiza o estado local das sessões
      if (sessions && sessions.sessions) {
        const updatedSessions = sessions.sessions.map(s => {
          if (s.sessionId === session.sessionId) {
            return {
              ...s,
              totalTimeSpent: 0,
              avgTimePerAttempt: 0 // Atualiza o totalTimeSpent
            };
          }
          return s;
        });

        // Atualiza o estado das sessões
        setSessions(prevSessions => ({
          ...prevSessions,
          sessions: updatedSessions
        }));
      }

      showSnackbar('Timer resetado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao resetar o timer:', error);
      showSnackbar('Erro ao resetar o timer', 'error');
    }
  };
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const newElapsedTime = Math.floor((currentTime - (startTime || 0)) / 1000);
        setElapsedTime(newElapsedTime);

        // Atualiza o estado local das sessões em tempo real
        if (selectedUserSession && sessions && sessions.sessions) {
          const updatedSessions = sessions.sessions.map(s => {
            if (s.sessionId === selectedUserSession.sessionId) {
              return {
                ...s,
                totalTimeSpent: newElapsedTime,
                avgTimePerAttempt: newElapsedTime / s.attempts // Atualiza o totalTimeSpent
              };
            }
            return s;
          });

          // Atualiza o estado das sessões
          setSessions(prevSessions => ({
            ...prevSessions,
            sessions: updatedSessions
          }));
        }
      }, 1000); // Atualiza a cada segundo
    }
    return () => clearInterval(interval); // Limpa o intervalo quando o componente é desmontado ou o cronômetro é pausado
  }, [isRunning, startTime, selectedUserSession, sessions]);
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
    try {
      await registerItemDropsInSession(
        userId,
        selectedUserSession?.userCharId ?? '',
        selectedUserSession?.missionId ?? '',
        selectedUserSession?.sessionId ?? '',
        { drops }
      );
    } catch (error) {
      console.error('Erro ao registrar drops:', error);
    }
  };

  const fetchMissions = async () => {
    try {
      const data = await getAllMissions();
      const userSessions = await getAllUserSessions(userId);
      setMissions(data.results || []);
      setSessions(userSessions.results || []);
    } catch (error) {
      console.error('Erro ao buscar missões ou sessões: ', error);
    }
  };
  const handleOpenDropItemsModal = (session: Session) => {
    setSelectedUserSession(session);
    setDropItemsModalOpen(true);
  };
  const handleOpenModal = (session?: Session) => {
    if (session) pauseTimer(session);
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
      fetchMissions();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteFarmSession = async (sessionId: string) => {
    try {
      await deleteFarmSession(sessionId);
      fetchMissions();
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
          bgcolor: green[800]
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
            width: '80%'
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
          </Stack>

          <Box
            sx={{
              overflowY: 'auto',
              paddingX: '20px',
              height: '72vh'
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
                    {/* Área clicável para expandir */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexGrow: 1
                      }}
                      onClick={() => handleExpand(sessionItem.sessionId)}
                    >
                      <Stack justifyContent="center" alignItems="center" width="180px">
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

                    {/* Conteúdo principal do card */}
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
                        <CardCustom>
                          <Stack
                            direction="row"
                            spacing={2}
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
                                {formatTime(sessionItem?.totalTimeSpent, 'text')}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2">Tempo Médio por Ida</Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {formatTime(sessionItem?.avgTimePerAttempt, 'text')}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardCustom>
                        <CardCustom>
                          <Stack direction="column">
                            <Tooltip title="Iniciar Sessão" placement="top-start">
                              <IconButton
                                onClick={() => startTimer(sessionItem)}
                                disabled={isRunning}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Pausar Sessão" placement="top-start">
                              <IconButton
                                onClick={() => pauseTimer(sessionItem)}
                                disabled={!isRunning}
                              >
                                <Pause />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Resetar Timer da Sessão" placement="top-start">
                              <IconButton
                                onClick={() => resetTimer(sessionItem)}
                                disabled={!isRunning && elapsedTime === 0}
                              >
                                <Stop />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardCustom>
                        <CardCustom>
                          <Stack spacing={1} sx={{ textAlign: 'center' }}>
                            {/* Criado em */}
                            <Typography variant="body2">Criado em</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {new Date(sessionItem?.created_at).toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="body2">Última Modificação</Typography>
                            <Typography variant="body1" fontWeight="bold">
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
                      <Box>
                      <Button
                        variant="contained"
                        onClick={() => handleOpenDropItemsModal(sessionItem)}
                        sx={{  maxWidth: 120, padding: 2, borderRadius:"12px", color:"white", bgcolor:blue[600], ml:"40px" }}
                      >
                        Registrar Itens Dropados
                      </Button>
                    </Box>
                      </Stack>
                    </Box>
               

                    {/* Ícones de edição e exclusão */}
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
                      <IconButton
                        onClick={() => handleExpand(sessionItem.sessionId)}
                        sx={{ color: 'white' }}
                      >
                        {expandedId === sessionItem.sessionId ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </Card>
                  <Collapse in={expandedId === sessionItem.sessionId}>
                    <Box
                      sx={{
                        padding: 2,
                        bgcolor: blue[900],
                        borderRadius: '0 0 6px 6px',
                        marginTop: '-18px' // Para unir visualmente com o card acima
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" sx={{ my: 1, color: 'white' }}>
                        Estatísticas de DropRate
                      </Typography>
                      <Box
                        sx={{
                          padding: '16px',
                          borderRadius: '8px'
                        }}
                      >
                        <Grid container spacing={2}>
                          {sessionDropRate?.dropRates && sessionDropRate.dropRates.length > 0 ? (
                            sessionDropRate.dropRates.map(item => (
                              <Grid item xs={2} sm={2} key={item.itemName}>
                                <Card
                                  elevation={3}
                                  sx={{
                                    width: '100%',
                                    p: 2,
                                    borderRadius: '8px',
                                    bgcolor: blue[800]
                                  }}
                                >
                                  <Stack
                                    spacing={1}
                                    sx={{
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {item.totalDropped}x{''} {item.itemName}
                                    </Typography>

                                    <Box
                                      sx={{
                                        width: '80%',
                                        height: 1,
                                        bgcolor: grey[300],
                                        borderRadius: '4px',
                                        my: 1
                                      }}
                                    />
                                    <Stack flexDirection="row">
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          olor: grey[200],
                                          fontWeight: 'bold',
                                          mr: '5px'
                                        }}
                                      >
                                        Drop Rate:
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          color: green[400],
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        {item.dropRate}%
                                      </Typography>
                                    </Stack>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 'bold',
                                        color: grey[200]
                                      }}
                                    >
                                      Tempo Médio por Drop:
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 'bold',
                                        color: green[400]
                                      }}
                                    >
                                      {formatTime(Number(item.avgTimePerDrop), 'text')}
                                    </Typography>
                                  </Stack>
                                </Card>
                              </Grid>
                            ))
                          ) : (
                            <Grid item xs={12}>
                              <Typography
                                variant="body2"
                                sx={{
                                  textAlign: 'center',
                                  color: 'gray'
                                }}
                              >
                                Nenhum dado disponível
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Box>
                  </Collapse>
                </Grid>
              ))}
            </Grid>

            <CreateSessionModal
              openModal={openModal}
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

export default DashboardPage;
