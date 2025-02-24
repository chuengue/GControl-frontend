import { Box, Checkbox, LinearProgress, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import theme from '../../../../../theme';
import { UserCharacter } from '../../../../interfaces/char';
import { CharacterMissions, MissionResult } from '../../../../service/requests/limitedMissions/types';

interface Props {
  missions: MissionResult[] | undefined;
  UserCharsLogs: CharacterMissions[] | undefined;
  userChars: UserCharacter[] | undefined;
  loading: boolean;
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
  loading,
  handleRegisterMission
}) => {
  const [completedMissions, setCompletedMissions] = useState<
    Record<string, Record<string, boolean[]>>
  >({});

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
    handleRegisterMission({
      characterId,
      missionId,
      attemptIndex,
      completed
    });
    handleCheckboxChange(characterId, missionId, attemptIndex);
  };
  useEffect(() => {
    if (loading) {
      document.body.style.cursor = 'progress';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [loading]);
  // Função para calcular o progresso de cada personagem
  const calculateProgress = (characterId: string) => {
    if (!missions || !completedMissions[characterId]) return 0;

    const totalMissions = missions.length;
    const completedCount = missions.filter(mission => {
      const attempts = completedMissions[characterId][mission.id];
      return attempts && attempts.some(attempt => attempt);
    }).length;

    return (completedCount / totalMissions) * 100;
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
      overflow: 'auto',
      maxWidth: '100%',
      height: 'calc(100vh - 140px)'
    }}
  >
    <Table size="small">
      <TableHead
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: theme.palette.grey[900]
        }}
      >
        <TableRow>
          <TableCell
            sx={{
              position: 'sticky',
              left: 0,
              zIndex: 3,
              bgcolor: theme.palette.grey[900],
              fontWeight: 'bold'
            }}
          >
            Personagem
          </TableCell>
          {missions.map(mission => (
            <TableCell
              key={mission.id}
              align="center"
              sx={{
                minWidth: '130px',
                position: 'sticky',
                top: 0,
                bgcolor: theme.palette.grey[900],
                zIndex: 2
              }}
            >
              {mission.mission_imgUrl ? (
                <img src={mission.mission_imgUrl} alt={mission.mission_name} width={26} />
              ) : (
                <Skeleton variant="rectangular" width={26} height={26} />
              )}
              <br />
              <Tooltip title={mission.mission_name || ''} arrow>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    fontSize: '0.75rem'
                  }}
                >
                  {mission.mission_name || <Skeleton variant="text" width={60} />}
                </Typography>
              </Tooltip>
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
                bgcolor: theme.palette.grey[900],
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                padding: '8px'
              }}
            >
              {character.gameChar?.thumbImgUrl ? (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <img
                    src={character.gameChar.thumbImgUrl}
                    alt={character.gameChar.name}
                    width={40}
                    style={{ borderRadius: '6px' }}
                  />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {character.gameChar.name}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(character.id)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        mt: 0.5,
                        bgcolor: theme.palette.grey[800],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: theme.palette.success.main
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
                      {Math.round(calculateProgress(character.id))}%
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Skeleton variant="circular" width={30} height={30} />
              )}
            </TableCell>
  
            {missions.map(mission => (
              <TableCell key={mission.id} align="center" sx={{ width: '130px', padding: '6px' }}>
                <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5}>
                  {completedMissions[character.id]?.[mission.id]?.map((completed, index) => (
                    <Checkbox
                      key={index}
                      color="success"
                      disabled={loading}
                      checked={completed}
                      onChange={() => handleCheckbox(character.id, mission.id, index, completed)}
                      sx={{
                        padding: '4px',
                        '&.Mui-checked': {
                          bgcolor: 'rgba(76, 175, 80, 0.15)',
                          borderRadius: '4px'
                        }
                      }}
                    />
                  )) || <Skeleton variant="rectangular" width={22} height={22} />}
                </Box>
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
