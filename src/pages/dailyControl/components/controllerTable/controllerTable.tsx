import { Box, Checkbox, LinearProgress, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, Alert, Stack, Chip, CircularProgress } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import theme from '../../../../../theme';
import { UserCharacter } from '../../../../interfaces/char';
import { registerCompletedMission, removeRegisterCompletedMission } from '../../../../service/requests/limitedMissions/limitedMissions';
import { CharacterMissions, MissionResult } from '../../../../service/requests/limitedMissions/types';
import { useSession } from '../../../../SessionContext';
import { useSnackbarStore } from '../../../../stores/snackBarStore';

interface Props {
  missions: MissionResult[] | undefined;
  UserCharsLogs: CharacterMissions[] | undefined;
  userChars: UserCharacter[] | undefined;
}

// Add new interfaces for loading and error states
interface LoadingState {
  [characterId: string]: {
    [missionId: string]: boolean;
  };
}

interface ErrorState {
  [characterId: string]: {
    [missionId: string]: string | null;
  };
}

interface SortableTableRowProps {
  character: UserCharacter;
  missions: MissionResult[];
  completedMissions: Record<string, Record<string, boolean[]>>;
  handleCheckbox: (characterId: string, missionId: string, attemptIndex: number, completed: boolean) => void;
  loadingStates: LoadingState;
  errorStates: ErrorState;
  calculateProgress: (characterId: string) => number;
  id: string;
}

// Create a SortableTableRow component
const SortableTableRow: React.FC<SortableTableRowProps> = ({ character, missions, completedMissions, handleCheckbox, loadingStates, errorStates, calculateProgress, id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: character.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      sx={{
        backgroundColor: isDragging ? theme.palette.grey[800] : 'transparent',
        '&:hover': {
          bgcolor: `${theme.palette.grey[800]}80`,
        },
      }}
    >
      <TableCell
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 1,
          bgcolor: theme.palette.grey[900],
          padding: '8px 12px',
          borderBottom: `1px solid ${theme.palette.grey[800]}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
            <DragIndicatorIcon sx={{ color: theme.palette.grey[600] }} />
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {character.gameChar?.thumbImgUrl ? (
              <img
                src={character.gameChar.thumbImgUrl}
                alt={character.gameChar.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Skeleton variant="rectangular" width={40} height={40} />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 100 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {character.gameChar?.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={calculateProgress(character.id)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  flex: 1,
                  bgcolor: theme.palette.grey[800],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: theme.palette.success.main,
                }}
              >
                {Math.round(calculateProgress(character.id))}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </TableCell>

      {missions.map((mission: MissionResult) => {
        const missionAttempts = completedMissions[character.id]?.[mission.id] || [];
        const isLoading = loadingStates[character.id]?.[mission.id] || false;
        const error = errorStates[character.id]?.[mission.id];

        return (
          <TableCell
            key={mission.id}
            align="center"
            sx={{
              padding: '4px',
              borderBottom: `1px solid ${theme.palette.grey[800]}`,
              position: 'relative',
            }}
          >
            <Tooltip title={error || ''} open={!!error}>
              <Box
                display="flex"
                justifyContent="center"
                flexWrap="wrap"
                gap={0.5}
                sx={{
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {missionAttempts.map((completed: boolean, index: number) => (
                  <Checkbox
                    key={index}
                    size="small"
                    color="success"
                    disabled={isLoading}
                    checked={completed}
                    onChange={() => handleCheckbox(character.id, mission.id, index, completed)}
                    sx={{
                      padding: '2px',
                      transition: 'all 0.2s ease-in-out',
                      '&.Mui-checked': {
                        bgcolor: 'rgba(76, 175, 80, 0.15)',
                        borderRadius: '4px',
                        transform: 'scale(1.05)',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(76, 175, 80, 0.08)',
                        borderRadius: '4px',
                      },
                    }}
                  />
                ))}
                {isLoading && (
                  <CircularProgress
                    size={20}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          </TableCell>
        );
      })}
    </TableRow>
  );
};

const MissionControlTable: React.FC<Props> = ({
  missions,
  UserCharsLogs,
  userChars,
}) => {
  const [completedMissions, setCompletedMissions] = useState<
    Record<string, Record<string, boolean[]>>
  >({});
  const {session} = useSession()
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const [errorStates, setErrorStates] = useState<ErrorState>({});
  const { showSnackbar } = useSnackbarStore();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [characters, setCharacters] = useState<UserCharacter[]>(userChars || []);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

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

  useEffect(() => {
    // Load saved order from localStorage or use default order
    const savedOrder = localStorage.getItem('characterOrder');
    if (savedOrder && userChars) {
      try {
        const orderMap = new Map(JSON.parse(savedOrder));
        const orderedChars = [...userChars].sort((a, b) => {
          const orderA = Number(orderMap.get(a.id)) ?? Number.MAX_SAFE_INTEGER;
          const orderB = Number(orderMap.get(b.id)) ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        setCharacters(orderedChars);
      } catch (error) {
        console.error('Error parsing character order:', error);
        setCharacters(userChars);
      }
    } else {
      setCharacters(userChars || []);
    }
  }, [userChars]);

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

  // Update loading state helper
  const setMissionLoadingState = (characterId: string, missionId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [characterId]: {
        ...(prev[characterId] || {}),
        [missionId]: isLoading,
      },
    }));
  };

  // Update error state helper
  const setMissionErrorState = (characterId: string, missionId: string, error: string | null) => {
    setErrorStates(prev => ({
      ...prev,
      [characterId]: {
        ...(prev[characterId] || {}),
        [missionId]: error,
      },
    }));
  };

  const handleCheckbox = async (characterId: string, missionId: string, attemptIndex: number, completed: boolean) => {
    if (!session) {
      showSnackbar('Você precisa estar logado para atualizar missões', 'error');
      return;
    }

    // Check if this specific mission is already loading
    if (loadingStates[characterId]?.[missionId]) {
      return;
    }

    setMissionLoadingState(characterId, missionId, true);
    setMissionErrorState(characterId, missionId, null);

    try {
      if (completed) {
        await removeRegisterCompletedMission(characterId, missionId);
      } else {
        await registerCompletedMission(session.user.uid, characterId, missionId);
      }
      
      handleCheckboxChange(characterId, missionId, attemptIndex);
      setMissionErrorState(characterId, missionId, null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showSnackbar(`Erro ao atualizar a missão: ${errorMessage}`, 'error');
      setMissionErrorState(characterId, missionId, errorMessage);
      console.error('Erro ao atualizar a missão:', error);
    } finally {
      setMissionLoadingState(characterId, missionId, false);
    }
  };

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

  // Group and sort missions by type (Epic first)
  const groupedMissions = missions?.reduce((acc, mission) => {
    const type = mission.mission_type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(mission);
    return acc;
  }, {} as Record<string, MissionResult[]>);

  // Sort mission types to have Epic first
  const sortedMissionTypes = Object.entries(groupedMissions || {}).sort(([typeA], [typeB]) => {
    if (typeA.toLowerCase().includes('epic')) return -1;
    if (typeB.toLowerCase().includes('epic')) return 1;
    return 0;
  });

  // Calculate mission completion summary
  const getMissionSummary = (missionId: string) => {
    if (!userChars || !completedMissions) return { completed: 0, total: 0 };
    
    const total = userChars.length;
    const completed = userChars.reduce((count, char) => {
      const charMissions = completedMissions[char.id]?.[missionId] || [];
      return count + (charMissions.some(status => status) ? 1 : 0);
    }, 0);

    return { completed, total };
  };

  const handleScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      const scrollLeftNum = Number(scrollLeft);
      const scrollWidthNum = Number(scrollWidth);
      const clientWidthNum = Number(clientWidth);
      const scrollThreshold = 10;
      
      setShowLeftArrow(scrollLeftNum > 0);
      setShowRightArrow(Math.floor(scrollLeftNum) < Math.floor(scrollWidthNum - clientWidthNum - scrollThreshold));
    }
  };

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => tableContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = tableContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      tableContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over?.id) {
      setCharacters((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newOrder = [...items];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        
        // Save the new order to localStorage
        const orderMap = new Map(newOrder.map((char, index) => [char.id, index]));
        localStorage.setItem('characterOrder', JSON.stringify(Array.from(orderMap.entries())));
        
        return newOrder;
      });
    }
  };

  if (!missions || !userChars || missions.length === 0 || userChars.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          p: 4,
          bgcolor: theme.palette.grey[900],
          borderRadius: '16px',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: '140px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: theme.palette.grey[800],
            borderRadius: '50%',
            mb: 2,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}22, ${theme.palette.primary.main}00)`,
              animation: 'pulse 2s infinite',
            },
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 0.8,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.4,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 0.8,
              },
            },
          }}
        >
          <GroupAddIcon 
            sx={{ 
              fontSize: 70,
              color: theme.palette.primary.main,
            }} 
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.grey[100], mb: 1 }}>
          Comece sua Jornada
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.grey[400], maxWidth: '600px', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Adicione seus personagens para começar a acompanhar suas missões diárias. Organize, acompanhe o progresso e nunca mais perca uma missão importante!
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '180px' }}>
            <PersonAddIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="body2" sx={{ color: theme.palette.grey[300], fontWeight: 500 }}>
              Adicione seus personagens favoritos
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', maxWidth: '180px' }}>
            <DragIndicatorIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="body2" sx={{ color: theme.palette.grey[300], fontWeight: 500 }}>
              Organize na ordem que preferir
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', maxWidth: '180px' }}>
            <EmojiEventsIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="body2" sx={{ color: theme.palette.grey[300], fontWeight: 500 }}>
              Acompanhe seu progresso
            </Typography>
          </Box>
        </Box>
        <Box
          component="button"
          onClick={() => window.location.href = '/characters'}
          sx={{
            mt: 4,
            px: 6,
            py: 2,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          <PersonAddIcon sx={{ fontSize: 24 }} />
          Começar Agora
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={2} mb={2}>
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              color: theme.palette.info.main
            }
          }}
        >
          As missões são redefinidas diariamente junto com o reset do jogo às 03:00 (Horario de Brasília)
        </Alert>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            p: 2,
            bgcolor: theme.palette.grey[900],
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {Object.values(groupedMissions || {}).flat().map(mission => {
            const { completed, total } = getMissionSummary(mission.id);
            return (
              <Chip
                key={mission.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{mission.mission_name}</Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: completed === total 
                          ? theme.palette.success.main 
                          : theme.palette.text.secondary 
                      }}
                    >
                      {completed}/{total}
                    </Typography>
                  </Box>
                }
                sx={{
                  bgcolor: theme.palette.grey[800],
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            );
          })}
        </Box>
      </Stack>

      <Box sx={{ position: 'relative' }}>
        {showLeftArrow && (
          <Box
            onClick={() => scrollTable('left')}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              height: 'auto',
              cursor: 'pointer',
            }}
          >
            <KeyboardArrowLeftIcon 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.grey[300],
                backgroundColor: theme.palette.grey[800],
                borderRadius: '50%',
                p: 1,
                '&:hover': {
                  backgroundColor: theme.palette.grey[700],
                }
              }} 
            />
          </Box>
        )}
        
        {showRightArrow && (
          <Box
            onClick={() => scrollTable('right')}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              height: 'auto',
              cursor: 'pointer',
            }}
          >
            <KeyboardArrowRightIcon 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.grey[300],
                backgroundColor: theme.palette.grey[800],
                borderRadius: '50%',
                p: 1,
                '&:hover': {
                  backgroundColor: theme.palette.grey[700],
                }
              }} 
            />
          </Box>
        )}

        <TableContainer
          ref={tableContainerRef}
          component={Paper}
          sx={{
            borderRadius: '16px',
            bgcolor: theme.palette.grey[900],
            overflow: 'auto',
            maxWidth: '100%',
            height: 'calc(100vh - 280px)',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.grey[900],
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.grey[700],
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.grey[600],
            },
          }}
        >
          <Table size="small">
            <TableHead
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 2,
                bgcolor: theme.palette.grey[900],
              }}
            >
              <TableRow>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    bgcolor: theme.palette.grey[900],
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '12px',
                    borderBottom: `1px solid ${theme.palette.grey[800]}`,
                    width: '200px',
                  }}
                >
                  Personagem
                </TableCell>
                {sortedMissionTypes.flatMap(([_, missions]) =>
                  missions.map(mission => (
                    <TableCell
                      key={mission.id}
                      align="center"
                      sx={{
                        padding: '8px',
                        minWidth: '120px',
                        bgcolor: theme.palette.grey[900],
                        borderBottom: `1px solid ${theme.palette.grey[800]}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        >
                          {mission.mission_imgUrl ? (
                            <img
                              src={mission.mission_imgUrl}
                              alt={mission.mission_name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Skeleton variant="rectangular" width={32} height={32} />
                          )}
                        </Box>
                        <Tooltip title={`Tentativas: ${mission.max_attempts}`} arrow>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              maxWidth: '100px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {mission.mission_name}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  ))
                )}
              </TableRow>
            </TableHead>

            <DndContext 
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <TableBody>
                <SortableContext
                  items={characters.map(char => char.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {characters.map(character => (
                    <SortableTableRow
                      key={character.id}
                      character={character}
                      missions={missions || []}
                      completedMissions={completedMissions}
                      handleCheckbox={handleCheckbox}
                      loadingStates={loadingStates}
                      errorStates={errorStates}
                      calculateProgress={calculateProgress}
                      id={character.id}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </DndContext>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default MissionControlTable;
