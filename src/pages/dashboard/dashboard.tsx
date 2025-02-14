import { Close, DeleteForever, InfoOutlined } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Autocomplete, Avatar, Box, Button, Card, Divider, Grid, IconButton, MenuItem, Modal, Select, Stack, TextField, Typography, useTheme } from '@mui/material';
import { blue, green, grey } from '@mui/material/colors';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';

import { createFarmSession, deleteFarmSession, getAllMissions, getAllUserSessions, updateFarmSession } from '../../service/requests/missions/missions';
import { FarmSessionsResponse } from '../../service/requests/missions/type';
import { useSession } from '../../SessionContext';
import { CardCustom } from '../../shared/components/cardCustom/cardCustom';
import ConfirmationModal from '../../shared/components/confirmModal/confirmModal';
import { Character, Mission, Session } from '../../shared/types';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';

export interface IFormData {
   sessionId: string;
   timeSpent: string;
   name: string | null;
   attempts: number;
}

const DashboardPage = () => {
   const [sessions, setSessions] = useState<FarmSessionsResponse['results']>();
   const [missions, setMissions] = useState<Mission[]>([]);
   const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
   const [selectedCharacter, setSelectedCharacter] = useState<Character>();
   const [openModal, setOpenModal] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState<IFormData>();
   const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
   const [selectedUserSession, setSelectedUserSession] = useState<Session>();
   const { session } = useSession();
   const { showSnackbar } = useSnackbarStore();
   const { userChars, fetchUserCharsData } = useCharStore();
   const theme = useTheme();
   const userId = session?.user.uid;
   useEffect(() => {
      fetchUserCharsData(userId);
      fetchMissions();
   }, [userId]);
   function formatTime(totalTimeInSeconds: number, variant: 'text' | 'dots') {
      const time = Math.floor(totalTimeInSeconds);
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = time % 60;

      if (variant === 'text') {
         return [
            hours ? `${hours}h` : '',
            minutes ? `${minutes}m` : '',
            seconds ? `${seconds}s` : ''
         ]
            .filter(Boolean)
            .join(' ');
      } else {
         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
   }

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

   const handleOpenModal = (session?: Session) => {
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
      const searchUserCharId = userChars.find(
         ch => ch.gameChar.id === selectedCharacter?.id
      );
      try {
         if (isEditing) {
            await updateFarmSession(
               searchUserCharId?.id,
               formData.sessionId,
               selectedMission?.id,
               formData
            );
         } else {
            await createFarmSession(
               userId,
               searchUserCharId?.id,
               selectedMission?.id,
               formData
            );
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

   const getMissionTypeName = (type:string) => {

      switch (type) {
         case 'event':
            return 'Missões Evento';
         case 'epic':
            return 'Desafio Épico';
         default:
            return type;
      }
   }

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
                  Gerencie suas sessões de farm de maneira eficiente! Aqui você
                  pode criar novas sessões, registrar o tempo gasto e
                  tentativas, além de acompanhar missões e personagens
                  utilizados. Edite e atualize suas sessões conforme necessário
                  para manter um controle preciso do seu progresso.
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
                     borderRadius: '16px'
                  }}
               >
                  <Button
                     variant="contained"
                     size="large"
                     onClick={() => handleOpenModal()}
                     sx={{
                        marginBottom: 2,
                        width: '30%',
                        bgcolor: blue[700],
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
                                 '&:hover': {
                                    boxShadow: theme.shadows[6],
                                    transform: 'scale(1.01)'
                                 }
                              }}
                           >
                              <Box
                                 sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                 }}
                              >
                                 <Stack
                                    justifyContent="center"
                                    alignItems="center"
                                    width="180px"
                                 >
                                    {sessionItem.mission && (
                                       <img
                                          src={sessionItem.mission.imgUrl}
                                          alt={sessionItem.mission.name}
                                          width="70px"
                                          height="70px"
                                       />
                                    )}
                                    <Typography
                                       variant="caption"
                                       textAlign="center"
                                    >
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
                                          src={
                                             sessionItem.character.thumbImgUrl
                                          }
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
                                    justifyContent: 'space-around',
                                    alignItems: 'center',
                                    width: '100%',
                                    px: 2
                                 }}
                              >
                                 <CardCustom>
                                    <Typography variant="body2">
                                       Tempo Total
                                    </Typography>
                                    <Typography
                                       variant="body1"
                                       fontWeight="bold"
                                    >
                                       {formatTime(
                                          sessionItem?.totalTimeSpent,
                                          'text'
                                       )}
                                    </Typography>
                                 </CardCustom>

                                 <CardCustom>
                                    <Typography variant="body2">
                                       Idas
                                    </Typography>
                                    <Typography
                                       variant="body1"
                                       fontWeight="bold"
                                    >
                                       {sessionItem.attempts}
                                    </Typography>
                                 </CardCustom>
                                 <CardCustom>
                                    <Typography variant="body2">
                                       Tempo Médio por Ida
                                    </Typography>
                                    <Typography
                                       variant="body1"
                                       fontWeight="bold"
                                    >
                                       {formatTime(
                                          sessionItem?.avgTimePerAttempt,
                                          'text'
                                       )}
                                    </Typography>
                                 </CardCustom>

                                 <CardCustom>
                                    <Typography variant="body2">
                                       Criado em
                                    </Typography>
                                    <Typography
                                       variant="body1"
                                       fontWeight="bold"
                                    >
                                       {new Date(
                                          sessionItem?.created_at
                                       ).toLocaleDateString()}
                                    </Typography>
                                 </CardCustom>
                                 <CardCustom>
                                    <Typography variant="body2">
                                       Última Modificação
                                    </Typography>
                                    <Typography
                                       variant="body2"
                                       fontWeight="bold"
                                    >
                                       {new Date(
                                          sessionItem?.updated_at
                                       ).toLocaleString('pt-BR', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false
                                       })}
                                    </Typography>
                                 </CardCustom>
                              </Box>
                              <IconButton
                                 onClick={() => handleOpenModal(sessionItem)}
                                 sx={{ color: 'white' }}
                              >
                                 <EditIcon />
                              </IconButton>
                              <IconButton
                                 onClick={() =>
                                    handleOpenModalConfirm(sessionItem)
                                 }
                                 sx={{ color: 'white' }}
                              >
                                 <DeleteForever />
                              </IconButton>
                           </Card>
                        </Grid>
                     ))}
                  </Grid>

                  <Modal open={openModal} onClose={handleCloseModal}>
                     <Box
                        sx={{
                           position: 'absolute',
                           top: '50%',
                           left: '50%',
                           transform: 'translate(-50%, -50%)',
                           width: 600,
                           bgcolor: blue[800],
                           boxShadow: 24,
                           borderRadius: 4, // Cantos mais arredondados
                           p: 4,
                           display: 'flex',
                           flexDirection: 'column',
                           gap: 3,
                           outline: 'none' // Remove o contorno ao focar
                        }}
                     >
                        {/* Botão de fechar no canto superior direito */}
                        <Box
                           sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              cursor: 'pointer',
                              color: 'text.secondary',
                              '&:hover': {
                                 color: 'text.primary'
                              }
                           }}
                           onClick={handleCloseModal}
                        >
                           <Close />
                        </Box>

                        <Typography
                           variant="h5"
                           marginBottom={2}
                           align="center"
                           fontFamily="faktos"
                        >
                           {isEditing ? 'Editar Sessão' : 'Criar Sessão'}
                        </Typography>

                        <Autocomplete
                           options={missions || []}
                           groupBy={mission => mission.type} 
                           getOptionLabel={mission => mission.name}
                           value={selectedMission || null}
                           onChange={(_, newValue) =>
                              setSelectedMission(newValue)
                           }
                           isOptionEqualToValue={(option, value) =>
                              option.id === value?.id
                           }
                           renderInput={params => (
                              <TextField
                                 {...params}
                                 label="Escolha uma missão"
                                 fullWidth
                                 sx={{ marginBottom: 2 }}
                              />
                           )}
                           renderOption={(props, mission) => (
                              <Box component="li" {...props} key={mission.id}>
                                 <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                 >
                                    <Avatar
                                       alt={mission.name}
                                       src={mission.imgUrl}
                                       sx={{ width: 32, height: 32 }}
                                    />
                                    <Typography
                                       variant="body2"
                                       fontWeight="bold"
                                    >
                                       {mission.name}
                                    </Typography>
                                 </Stack>
                              </Box>
                           )}
                           renderGroup={(params) => (
                              <Box key={params.key} sx={{ mt: 2 }}>
                                 <Box
                                    sx={{
                                       bgcolor: blue[700], // Cor de fundo azul
                                       color: "white", // Texto branco para contraste
                                       borderRadius: "8px", // Bordas arredondadas
                                       padding: "8px",
                                       textAlign: "center", // Centraliza o texto
                                       display: "flex",
                                       justifyContent: "center",
                                       alignItems: "center",
                                       width: "100%", // Ocupa toda a largura do grupo
                                    }}
                                 >
                                    <Typography variant="subtitle1" fontWeight="bold">
                                       {getMissionTypeName(params.group)}
                                    </Typography>
                                 </Box>
                                 <Box
                                    sx={{
                                       border: `1px solid ${grey[800]}`,
                                       borderRadius: "8px",
                                       padding: "8px",
                                       backgroundColor: grey[900],
                                       mt: 1,
                                    }}
                                 >
                                    {params.children} {/* Renderiza as missões dentro do grupo */}
                                 </Box>
                              </Box>
                           )}
                        />

                        <Select
                           fullWidth
                           value={selectedCharacter?.id || ''}
                           onChange={e => {
                              const selectedChar =
                                 userChars.find(
                                    m => m.gameChar.id === e.target.value
                                 ) || null;
                              console.log(selectedChar);
                              setSelectedCharacter(selectedChar?.gameChar);
                           }}
                           displayEmpty
                           sx={{ marginBottom: 2 }}
                           MenuProps={{
                              PaperProps: {
                                 style: {
                                    maxHeight: 200, // Limita a altura para não ficar gigante
                                    overflowY: 'auto' // Adiciona rolagem se necessário
                                 }
                              },
                              anchorOrigin: {
                                 vertical: 'bottom',
                                 horizontal: 'left'
                              },
                              transformOrigin: {
                                 vertical: 'top',
                                 horizontal: 'left'
                              }
                           }}
                        >
                           <MenuItem value="" disabled>
                              Escolha um personagem
                           </MenuItem>
                           {userChars?.map(char => (
                              <MenuItem
                                 key={char.gameChar.id}
                                 value={char.gameChar.id}
                              >
                                 {char.gameChar.name}
                              </MenuItem>
                           ))}
                        </Select>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                           <TimePicker
                              label="Tempo Gasto"
                              ampm={false}
                              value={
                                 formData?.timeSpent
                                    ? parse(
                                         formData.timeSpent,
                                         'HH:mm:ss',
                                         new Date()
                                      )
                                    : null
                              }
                              onChange={newValue => {
                                 const formattedTime = newValue
                                    ? format(newValue, 'HH:mm:ss')
                                    : '';
                                 setFormData({
                                    ...formData,
                                    timeSpent: formattedTime
                                 });
                              }}
                              views={['hours', 'minutes', 'seconds']}
                              inputFormat="HH:mm:ss"
                              renderInput={params => (
                                 <TextField
                                    {...params}
                                    fullWidth
                                    sx={{ marginBottom: 2 }}
                                 />
                              )}
                           />
                        </LocalizationProvider>

                        <TextField
                           fullWidth
                           label="Tentativas"
                           type="number"
                           value={formData?.attempts || 0}
                           onChange={e =>
                              setFormData({
                                 ...formData,
                                 attempts: e.target.value
                              })
                           }
                           sx={{ marginBottom: 2 }}
                        />

                        <Button
                           variant="contained"
                           size="large"
                           onClick={handleSaveSession}
                           sx={{
                              bgcolor: theme.palette.primary.main,
                              '&:hover': {
                                 bgcolor: theme.palette.primary.dark
                              },
                              borderRadius: 2
                           }}
                        >
                           {isEditing ? 'Atualizar' : 'Criar'}
                        </Button>
                     </Box>
                  </Modal>
                  <ConfirmationModal
                     open={confirmModalIsOpen}
                     title="Excluir Sessão"
                     message="Tem certeza que deseja excluir esta sessão?"
                     onClose={handleCloseModalConfirm}
                     onConfirm={() =>
                        handleDeleteFarmSession(selectedUserSession?.sessionId)
                     }
                  ></ConfirmationModal>
               </Box>
            </Box>
         </Box>
      </>
   );
};

export default DashboardPage;
