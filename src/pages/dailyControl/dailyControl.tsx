import { Box } from '@mui/material';
import React, { useState } from 'react';

import {
  getAllLimitedMissions,
  getUserMissionsLogs,
  registerCompletedMission,
  removeRegisterCompletedMission
} from '../../service/requests/limitedMissions/limitedMissions';
import { CharacterMissions, MissionResult } from '../../service/requests/limitedMissions/types';
import { useSession } from '../../SessionContext';
import useCharStore from '../../stores/charStore';
import MissionControlTable from './components/controllerTable/controllerTable';

const DailyControl = () => {
  const [limitedMissions, setLimitedMissions] = useState<MissionResult[]>();
  const [logs, setLogs] = useState<CharacterMissions[]>();
  const { session } = useSession();
  const { fetchUserCharsData, userChars } = useCharStore();

  const fetchLimitedMissions = async () => {
    try {
      const data = await getAllLimitedMissions();
      setLimitedMissions(data.results);
    } catch (error) {}
  };
  const fetchUserMissionLogs = async () => {
    if (!session) return;
    try {
      const data = await getUserMissionsLogs(session?.user.uid);
      setLogs(data.results);
    } catch (error) {}
  };

  React.useEffect(() => {
    if (!session) return;
    fetchLimitedMissions();
    fetchUserMissionLogs();
    fetchUserCharsData(session?.user.uid);
  }, []);

  const handleCheckbox = async (characterId: string, missionId: string, completed: boolean) => {
    if (!session) return;

    try {
      if (completed) {
        await removeRegisterCompletedMission(characterId, missionId);
      } else {
        await registerCompletedMission(session.user.uid, characterId, missionId);
      }
    } catch (error) {
      console.error('Erro ao atualizar a missão:', error);
    }
  };

  return (
    <Box>
      <MissionControlTable
        missions={limitedMissions}
        UserCharsLogs={logs}
        userChars={userChars}
        handleRegisterMission={e => handleCheckbox(e.characterId, e.missionId, e.completed)}
      />
    </Box>
  );
};
export default DailyControl;
