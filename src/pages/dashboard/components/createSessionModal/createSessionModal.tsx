import { Close } from '@mui/icons-material';
import { Autocomplete, Avatar, Box, Button, MenuItem, Modal, Select, Stack, TextField, Typography } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';

const CreateSessionModal = ({
  openModal,
  handleCloseModal,
  isEditing,
  missions,
  selectedMission,
  setSelectedMission,
  userChars,
  selectedCharacter,
  setSelectedCharacter,
  formData,
  setFormData,
  handleSaveSession,
  isLoading
}) => {
  const [missionError, setMissionError] = useState(false);
  const [characterError, setCharacterError] = useState(false);
  const getMissionTypeName = (type: string) => {
    switch (type) {
      case 'event':
        return 'Missões Evento';
      case 'epic':
        return 'Desafio Épico';
      default:
        return type;
    }
  };

  const handleSubmit = () => {
    if (!selectedMission) {
      setMissionError(true);
      return;
    }
    if (!selectedCharacter) {
      setCharacterError(true);
      return;
    }
    handleSaveSession();
  };
  const handleClose = () => {
    handleCloseModal();
    setMissionError(false);
    setCharacterError(false);
    setFormData({
      date: null,
      time: null,
      notes: ''
    });
    setSelectedMission(null);
    setSelectedCharacter(null);
  }
  useEffect(()=>{
    if(isLoading){
      document.body.style.cursor = 'wait'
    }else{
      document.body.style.cursor = 'default'
      handleClose();

    }
  },[isLoading])
  return (
    <Modal open={openModal} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: {xs:"100%", md:"600px"},
          bgcolor: blue[800],
          boxShadow: 24,
          borderRadius: 4,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          outline: 'none'
        }}
      >
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

        <Typography variant="h5" align="center" fontFamily="faktos">
          {isEditing ? 'Editar Sessão' : 'Criar Sessão'}
        </Typography>
        <Autocomplete
          options={missions || []}
          groupBy={mission => mission.type}
          getOptionLabel={mission => mission.name}
          value={selectedMission || null}
          onChange={(_, newValue) => {
            setSelectedMission(newValue);
            setMissionError(false);
          }}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          renderInput={params => (
            <TextField
              {...params}
              label="Escolha uma missão"
              fullWidth
              error={missionError}
              helperText={missionError ? 'A missão não pode ser vazia' : ''}
            />
          )}
          renderOption={(props, mission) => (
            <Box component="li" {...props} key={mission.id}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar alt={mission.name} src={mission.imgUrl} sx={{ width: 32, height: 32 }} />
                <Typography variant="body2" fontWeight="bold">
                  {mission.name}
                </Typography>
              </Stack>
            </Box>
          )}
          renderGroup={params => (
            <Box key={params.key} sx={{ mt: 2 }}>
              <Box
                sx={{
                  bgcolor: blue[700],
                  color: 'white',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {getMissionTypeName(params.group)}
                </Typography>
              </Box>
              <Box
                sx={{
                  border: `1px solid ${grey[800]}`,
                  borderRadius: '8px',
                  padding: '8px',
                  backgroundColor: grey[900],
                  mt: 1
                }}
              >
                {params.children}
              </Box>
            </Box>
          )}
        />

        <Select
          fullWidth
          value={selectedCharacter?.id || ''}
          onChange={e => {
            const selectedChar = userChars.find(m => m.gameChar.id === e.target.value) || null;
            setSelectedCharacter(selectedChar?.gameChar);
            setCharacterError(false);
          }}
          error={characterError}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Escolha um personagem
          </MenuItem>
          {userChars?.map(char => (
            <MenuItem key={char.gameChar.id} value={char.gameChar.id}>
              {char.gameChar.name}
            </MenuItem>
          ))}
        </Select>
        {characterError && (
          <Typography color="error" variant="body2" sx={{mt:"-20px"}}>
            O personagem não pode ser vazio
          </Typography>
        )}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="Tempo Gasto"
            ampm={false}
            value={formData?.timeSpent ? parse(formData.timeSpent, 'HH:mm:ss', new Date()) : null}
            onChange={newValue => {
              const formattedTime = newValue ? format(newValue, 'HH:mm:ss') : '';
              setFormData({ ...formData, timeSpent: formattedTime });
            }}
            views={['hours', 'minutes', 'seconds']}
            format="HH:mm:ss"
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>

        <TextField
          fullWidth
          label="Tentativas"
          type="number"
          value={formData?.attempts || 0}
          onChange={e => setFormData({ ...formData, attempts: e.target.value })}
        />

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          loading={isLoading}
          sx={{
            bgcolor: blue[700],
            '&:hover': { bgcolor: blue[900] },
            borderRadius: 2,
            color:"white"
          }}
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateSessionModal;

