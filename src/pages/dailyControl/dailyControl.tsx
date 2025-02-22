import { Box, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import { getAllLimitedMissions, getUserMissionsLogs, registerCompletedMission, removeRegisterCompletedMission } from '../../service/requests/limitedMissions/limitedMissions';
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

  const handleCheckbox = async (characterId: string, missionId: string, completed: boolean) => {
    if (!session) return;
    setLoading(true)
    try {
      if (completed) {
        await removeRegisterCompletedMission(characterId, missionId);

      } else {
        await registerCompletedMission(session.user.uid, characterId, missionId);
      }
    } catch (error) {
      console.error('Erro ao atualizar a missão:', error);
    } finally{
      setLoading(false)
    }
  };

  return (
    <Box>
      {userChars && userChars.length > 0 ? (
        <MissionControlTable
          missions={limitedMissions}
          UserCharsLogs={logs}
          userChars={userChars}
          handleRegisterMission={e => handleCheckbox(e.characterId, e.missionId, e.completed)}
          loading={loading}
        />
      ) : (
        <Typography variant="h6" color="textSecondary" align="center" mt="40px">
        Parece que você ainda não tem personagens! Crie um para começar a se aventurar e acompanhar suas missões. <a style={{color:green[300], cursor:"pointer", textDecoration:"underline"}} onClick={() => navigate("/chars/add-user-char")}>Vamos lá?</a>
      </Typography>
      )}
    </Box>
  );
};

export default DailyControl;
