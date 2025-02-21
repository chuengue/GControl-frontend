import {
  Box,
  Checkbox,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import theme from '../../../../../theme';
import { UserCharacter } from '../../../../interfaces/char';
import {
  CharacterMissions,
  MissionResult
} from '../../../../service/requests/limitedMissions/types';
import { useSession } from '../../../../SessionContext';

interface Props {
  missions: MissionResult[] | undefined;
  UserCharsLogs: CharacterMissions[] | undefined;
  userChars: UserCharacter[] | undefined;
  handleRegisterMission: (data: {
    characterId: string;
    missionId: string;
    attemptIndex: number;
    completed: boolean;
  }) => void;
}

const MissionControlTable: React.FC<Props> = ({
  missions,
  UserCharsLogs,
  userChars,
  handleRegisterMission
}) => {
  const [completedMissions, setCompletedMissions] = useState<
    Record<string, Record<string, boolean[]>>
  >({});
  const { session } = useSession();

  useEffect(() => {
    if (
      !missions ||
      !UserCharsLogs ||
      !userChars ||
      missions.length === 0 ||
      userChars.length === 0
    ) {
      return;
    }

    const initialCompletedMissions = userChars.reduce(
      (acc, character) => {
        const charLog = UserCharsLogs.find(log => log.id === character.id);
        acc[character.id] = {};
        missions.forEach(mission => {
          acc[character.id][mission.id] =
            charLog?.missionsCompleted?.[mission.id]?.status ||
            new Array(mission.max_attempts).fill(false);
        });
        return acc;
      },
      {} as Record<string, Record<string, boolean[]>>
    );

    setCompletedMissions(initialCompletedMissions);
  }, [missions, UserCharsLogs, userChars]);

  const handleCheckboxChange = (characterId: string, missionId: string, attemptIndex: number) => {
    setCompletedMissions(prevState => {
      const newState = { ...prevState };
      newState[characterId] = { ...newState[characterId] };
      newState[characterId][missionId] = [...newState[characterId][missionId]];
      newState[characterId][missionId][attemptIndex] =
        !newState[characterId][missionId][attemptIndex];
      return newState;
    });
  };

  const handleCheckbox = (
    characterId: string,
    missionId: string,
    attemptIndex: number,
    completed: boolean
  ) => {
    console.log(completed);
    handleRegisterMission({
      characterId,
      missionId,
      attemptIndex,
      completed
    });
    handleCheckboxChange(characterId, missionId, attemptIndex);
  };

  if (!missions || !userChars || missions.length === 0 || userChars.length === 0) {
    return (
      <TableContainer component={Paper} sx={{}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Skeleton variant="text" width={100} height={30} />
              </TableCell>
              {[...Array(3)].map((_, index) => (
                <TableCell key={index} align="center">
                  <Skeleton
                    variant="rectangular"
                    width={30}
                    height={30}
                    sx={{ borderRadius: '8px' }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton
                    variant="rectangular"
                    width={30}
                    height={30}
                    sx={{ borderRadius: '8px' }}
                  />
                </TableCell>
                {[...Array(3)].map((_, index2) => (
                  <TableCell key={index2} align="center">
                    <Skeleton
                      variant="rectangular"
                      width={24}
                      height={24}
                      sx={{ borderRadius: '4px' }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={4}
      sx={{
        borderRadius: '12px',
        bgcolor: theme.palette.grey[900],
        overflow: 'auto', // Adiciona scroll horizontal
        maxWidth: '100%' ,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 1,
                bgcolor: theme.palette.grey[900]
              }}
            >
              Personagem
            </TableCell>
            {missions.map(mission => (
              <TableCell key={mission.id} align="center" sx={{ minWidth: '160px' }}>
                {mission.mission_imgUrl ? (
                  <img src={mission.mission_imgUrl} alt={mission.mission_name} width={30} />
                ) : (
                  <Skeleton variant="rectangular" width={30} height={30} />
                )}
                <br />
                {mission.mission_name || <Skeleton variant="text" width={60} />}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {userChars.map(character => (
            <TableRow key={character.id}>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  bgcolor: theme.palette.grey[900]
                }}
              >
                {character.gameChar?.thumbImgUrl ? (
                  <Box justifyContent="center" alignContent="center" display="flex">
                    <img
                      src={character.gameChar.thumbImgUrl}
                      alt={character.gameChar.name}
                      width={50}
                      style={{ borderRadius: '8px' }}
                    />
                  </Box>
                ) : (
                  <Skeleton variant="circular" width={30} height={30} />
                )}
              </TableCell>
              {missions.map(mission => (
                <TableCell key={mission.id} align="center" sx={{ width: '200px' }}>
                  {completedMissions[character.id]?.[mission.id]?.map((completed, index) => (
                    <Checkbox
                      key={index}
                      color="success"
                      checked={completed}
                      onChange={() => handleCheckbox(character.id, mission.id, index, completed)}
                    />
                  )) || <Skeleton variant="rectangular" width={24} height={24} />}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MissionControlTable;
