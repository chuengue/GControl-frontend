import { Box, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
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
  
  const handleGetNickname = async () => {
    try {
      if (session?.user?.uid) {
        const userDoc = await getDoc(doc(db, 'users', session.user.uid));
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Supondo que o apelido seja armazenado em "nickname"
          const nickname = userData?.nickNameGC;
          console.log(nickname);
          // Aqui você pode armazenar o nickname no estado ou fazer outras ações com ele
        } else {
          console.log('User not found');
        }
      }
    } catch (error) {
      console.error('Error retrieving nickname:', error);
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
    handleGetNickname()
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
        <Typography variant="h6" color="textSecondary" align="center" mt="40px">
        Parece que você ainda não tem personagens! Crie um para começar a se aventurar e acompanhar suas missões. <a style={{color:green[300], cursor:"pointer", textDecoration:"underline"}} onClick={() => navigate("/chars/add-user-char")}>Vamos lá?</a>
      </Typography>
      )}
    </Box>
  );
};

export default DailyControl;
