import { Box, Typography, Paper, Button } from '@mui/material';
import { getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { getAllLimitedMissions, getUserMissionsLogs } from '../../service/requests/limitedMissions/limitedMissions';
import { CharacterMissions, MissionResult } from '../../service/requests/limitedMissions/types';
import { useSession } from '../../SessionContext';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';
import MissionControlTable from './components/controllerTable/controllerTable';

const DailyControl = () => {
  const [limitedMissions, setLimitedMissions] = useState<MissionResult[]>();
  const [logs, setLogs] = useState<CharacterMissions[]>();
  const [loading, setLoading] = useState<boolean>();

  const { fetchUserCharsData, userChars } = useCharStore();
  const { session } = useSession();
  const { showSnackbar } = useSnackbarStore();
  const navigate =  useNavigate()
  const db = getFirestore();

  const fetchLimitedMissions = async () => {
    try {
      const data = await getAllLimitedMissions();
      setLimitedMissions(data.results);
    } catch (error) {
      showSnackbar("Erro ao atualizar Missão", 'error');
    }
  };
  

  
  
  const fetchUserMissionLogs = async () => {
    if (!session) return;
    try {
      const data = await getUserMissionsLogs(session?.user.uid);
      setLogs(data.results);
    } catch (error) {
      showSnackbar("Erro ao atualizar Missão", 'error');
    }
  };

  React.useEffect(() => {
    if (!session) return;
    fetchLimitedMissions();
    fetchUserMissionLogs();
    fetchUserCharsData(session?.user.uid);
  }, []);


  return (
    <Box>
      {userChars && userChars.length > 0 ? (
        <MissionControlTable
          missions={limitedMissions}
          UserCharsLogs={logs}
          userChars={userChars}
        />
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="70vh"
          textAlign="center"
          p={3}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              maxWidth: '600px',
              width: '100%',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <PersonAddIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.9 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                mb: 2,
                color: 'text.primary'
              }}
            >
              Comece Sua Jornada
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '480px', mx: 'auto' }}>
              Ainda não há personagens em sua conta. Crie seu primeiro personagem para começar suas aventuras e acompanhar suas missões diárias.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate("/chars/add-user-char")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              Criar meu primeiro personagem
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default DailyControl;
