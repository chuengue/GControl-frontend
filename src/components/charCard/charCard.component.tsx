import { DeleteForever } from '@mui/icons-material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { Avatar, Box, Button, Card, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { useNavigate } from 'react-router';

import { UserCharCardProps } from '../../interfaces/char';
import { deleteUserGameChar } from '../../service/requests/gameChar';
import { useSession } from '../../SessionContext';
import ConfirmationModal from '../../shared/components/confirmModal/confirmModal';
import { useSnackbarStore } from '../../stores/snackBarStore';

function CharCard({ chars, onAddCharacter, details = true }: UserCharCardProps) {
  const [confirmModalIsOpen, setConfirmModalIsOpen] = React.useState(false);
  const [userCharIdSelected, setUserCharIdSelected] = React.useState<string>();
  const [charList, setCharList] = React.useState(chars);

  const navigate = useNavigate();
  const { session } = useSession();
  const userId = session?.user.uid || '';
  const { showSnackbar } = useSnackbarStore();

  React.useEffect(() => {
    setCharList(chars);
  }, [chars]);
  
  const handleDetailsClick = (UserChardId: string) => {
    navigate(`/chars/details/${userId}/${UserChardId}`);
  };
  const handleCloseModalConfirm = () => {
    setConfirmModalIsOpen(false);
  };

  const handleOpenModalConfirm = (userCharId: string) => {
    setUserCharIdSelected(userCharId);
    setConfirmModalIsOpen(true);
  };

  const handleDeleteUserChar = async () => {
    try {
      const data = await deleteUserGameChar(session?.user.uid, userCharIdSelected);
      showSnackbar(data.results.message, 'success');
  
      // Atualiza a lista de personagens, removendo o excluído
      setCharList((prevChars) => prevChars.filter((char) => char.id !== userCharIdSelected));
  
      handleCloseModalConfirm();
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  }
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} width="100vw">
      {charList.map((char, index) => (
        <Grid size={4} key={index}>
          <Stack direction="column" spacing={2} sx={{ height: '100%' }}>
            <Card
              sx={{
                p: 2,
                bgcolor: blue[900],
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <Card
                elevation={2}
                sx={{
                  bgcolor: blue[800],
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  p: 2,
                  mb: 1
                }}
              >
                {char.level && (
                  <Stack>
                    <Typography variant="body2" color="white" textAlign="center">
                      Level
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: blue[500],
                        color: 'white'
                      }}
                    >
                      {char.level}
                    </Avatar>
                  </Stack>
                )}

                <Stack flexDirection="row" justifyContent="center" width="100%" display="flex">
                  <Typography variant="h4" fontFamily={'faktos'} color="white">
                    {char.gameChar.name}
                  </Typography>
                </Stack>
              </Card>

              <Box display="flex" justifyContent="center" sx={{ flexGrow: 1 }}>
                {char.gameChar.classes.length > 0 && (
                  <img src={char.gameChar.defaultImgUrl} alt={char.gameChar.name} height="200px" />
                )}
              </Box>
              {details && (
                <>
                  <Card
                    elevation={2}
                    sx={{
                      bgcolor: blue[800],
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      borderRadius: '12px',
                      p: 1,
                      mt: 1
                    }}
                  >
                    <Stack>
                      <Typography sx={{ color: 'white' }}>
                        Ataque Total: {new Intl.NumberFormat().format(Number(char.atkTotal))}
                      </Typography>
                    </Stack>
                  </Card>
                  <Stack flexDirection="row" width="100%" gap={1}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleDetailsClick(char.id)}
                      startIcon={<AddCircleRoundedIcon />}
                      sx={{
                        bgcolor: blue[600],
                        color: 'white',
                        borderRadius: '12px',
                        p: 1,
                        mt: 1,
                        width: '90%'
                      }}
                    >
                      Ver detalhes
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModalConfirm(char.id)}
                      sx={{
                        bgcolor: blue[600],
                        color: 'white',
                        borderRadius: '12px',
                        p: 0.5,
                        mt: 1,
                        minWidth: '40px' // Deixa o botão mais compacto
                      }}
                    >
                      <DeleteForever />
                    </IconButton>
                  </Stack>
                </>
              )}
            </Card>
          </Stack>
        </Grid>
      ))}

      {/* Card para adicionar personagem */}
      <Grid size={4}>
        <Card
          sx={{
            p: 2,
            bgcolor: blue[700],
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: chars.length ? '100%' : '500px' // Garantindo que o card de adição ocupe toda a altura disponível
          }}
        >
          <Tooltip title="Adiciona Personagem">
            <IconButton onClick={onAddCharacter} size="large">
              <AddCircleRoundedIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Card>
      </Grid>
      <ConfirmationModal
        open={confirmModalIsOpen}
        title="Excluir Sessão"
        message="Tem certeza que deseja excluir esta sessão?"
        onClose={handleCloseModalConfirm}
        onConfirm={() => handleDeleteUserChar()}
      ></ConfirmationModal>
    </Grid>
  );
}

export default CharCard;
