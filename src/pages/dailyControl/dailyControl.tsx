import { Box, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import { getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

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
          minHeight="50vh"
          textAlign="center"
          p={3}
        >
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Nenhum personagem encontrado
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={2}>
            Parece que você ainda não tem personagens! Crie um para começar a se aventurar e acompanhar suas missões.
          </Typography>
          <Typography
            component="span"
            sx={{
              color: green[400],
              cursor: "pointer",
              textDecoration: "underline",
              '&:hover': {
                color: green[600],
              }
            }}
            onClick={() => navigate("/chars/add-user-char")}
          >
            Criar meu primeiro personagem
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DailyControl;
