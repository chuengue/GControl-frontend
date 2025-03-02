import { Box, Checkbox, LinearProgress, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, IconButton, alpha, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import { DragHandle } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

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

// Sortable Row Component
const SortableTableRow = ({ character, missions, completedMissions, handleCheckbox, loading, loadingStates, calculateProgress }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: character.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as 'relative',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      sx={{
        '&:hover': {
          bgcolor: alpha(theme.palette.grey[800], 0.3),
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      <TableCell
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '8px 12px',
          cursor: 'grab',
          borderBottom: `1px solid ${alpha(theme.palette.grey[700], 0.2)}`,
          '&:hover': {
            bgcolor: alpha(theme.palette.grey[800], 0.5),
          },
        }}
        {...attributes}
        {...listeners}
      >
        <DragHandle sx={{ color: theme.palette.grey[500], fontSize: 18 }} />
        {character.gameChar?.thumbImgUrl ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '6px',
                  boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                },
                '&:hover::after': {
                  opacity: 1,
                },
              }}
            >
              <img
                src={character.gameChar.thumbImgUrl}
                alt={character.gameChar.name}
                width={38}
                style={{ 
                  borderRadius: '6px',
                  border: `2px solid ${alpha(theme.palette.grey[700], 0.3)}`,
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: theme.palette.grey[100],
                  mb: 0.3
                }}
              >
                {character.gameChar.name}
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  width: '100px'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(character.id)}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.grey[800], 0.5),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                      }
                    }}
                  />
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.65rem',
                    color: theme.palette.grey[400],
                    minWidth: '24px',
                    textAlign: 'right'
                  }}
                >
                  {Math.round(calculateProgress(character.id))}%
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Skeleton variant="circular" width={38} height={38} />
        )}
      </TableCell>

      {missions.map(mission => (
        <TableCell 
          key={mission.id} 
          align="center" 
          sx={{ 
            width: '110px',
            padding: '4px 2px',
            borderBottom: `1px solid ${alpha(theme.palette.grey[700], 0.2)}`,
          }}
        >
          <Box 
            display="flex" 
            justifyContent="center" 
            flexWrap="wrap" 
            gap={0.3}
            sx={{
              padding: '2px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[800], 0.3),
              }
            }}
          >
            {completedMissions[character.id]?.[mission.id]?.map((completed, index) => {
              const loadingKey = `${character.id}-${mission.id}-${index}`;
              const isLoading = loadingStates[loadingKey];
              
              return (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress
                      size={16}
                      thickness={6}
                      sx={{
                        color: completed ? theme.palette.success.main : theme.palette.grey[400],
                      }}
                    />
                  ) : (
                    <Checkbox
                      color="success"
                      disabled={loading || isLoading}
                      checked={completed}
                      onChange={() => handleCheckbox(character.id, mission.id, index, completed)}
                      sx={{
                        padding: '1px',
                        opacity: isLoading ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        '& .MuiSvgIcon-root': {
                          fontSize: '1.1rem',
                        },
                        '&.Mui-checked': {
                          color: theme.palette.success.main,
                          bgcolor: alpha(theme.palette.success.main, 0.15),
                          borderRadius: '4px',
                        },
                        '&:hover': {
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          borderRadius: '4px',
                        },
                        '&.Mui-disabled': {
                          cursor: isLoading ? 'wait' : 'not-allowed',
                          opacity: 0.5,
                        }
                      }}
                    />
                  )}
                </Box>
              );
            }) || <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: '4px' }} />}
          </Box>
        </TableCell>
      ))}
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
  const [loading, setLoading] = useState<boolean>();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { showSnackbar } = useSnackbarStore();
  const [characters, setCharacters] = useState(userChars || []);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false,
  });

  // Load order from localStorage
  useEffect(() => {
    if (!userChars) return;
    
    const savedOrder = localStorage.getItem('characterOrder');
    if (savedOrder) {
      const orderIds = JSON.parse(savedOrder);
      const orderedChars = orderIds
        .map(id => userChars.find(char => char.id === id))
        .filter(Boolean);
      const remainingChars = userChars.filter(
        char => !orderIds.includes(char.id)
      );
      setCharacters([...orderedChars, ...remainingChars]);
    } else {
      setCharacters(userChars);
    }
  }, [userChars]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setCharacters((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        // Save order to localStorage
        localStorage.setItem(
          'characterOrder',
          JSON.stringify(newOrder.map(char => char.id))
        );
        
        return newOrder;
      });
    }
  };

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
 const handleCheckbox = async (characterId: string, missionId: string, attemptIndex: number, completed: boolean) => {
    if (!session) return;
    
    // Create a unique key for this character-mission combination
    const loadingKey = `${characterId}-${missionId}-${attemptIndex}`;
    
    // If this checkbox or any other is currently loading, prevent the action
    if (loadingStates[loadingKey]) {
      return;
    }
    
    // Set loading state for this specific checkbox
    setLoadingStates(prev => ({
      ...prev,
      [loadingKey]: true
    }));
    
    try {
      if (completed) {
        await removeRegisterCompletedMission(characterId, missionId);
      } else {
        await registerCompletedMission(session.user.uid, characterId, missionId);
      }
      handleCheckboxChange(characterId, missionId, attemptIndex);
    } catch (error) {
      showSnackbar('Erro ao atualizar a missão: ' + error, 'error');
      console.error('Erro ao atualizar a missão:', error);
    } finally {
      // Clear loading state for this specific checkbox
      setLoadingStates(prev => ({
        ...prev,
        [loadingKey]: false
      }));
    }
  };

  // Check if scroll buttons should be shown
  const checkScrollButtons = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth,
      });
    }
  };

  // Handle scroll events
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      // Check on window resize
      window.addEventListener('resize', checkScrollButtons);

      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  // Scroll handlers
  const handleScroll = (direction: 'left' | 'right') => {
    if (tableContainerRef.current) {
      const scrollAmount = 200; // Adjust this value to control scroll distance
      const newScrollLeft = tableContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      tableContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const calculateOverallProgress = () => {
    if (!characters || !missions) return { total: 0, completed: 0, percentage: 0 };
    
    const totalMissions = characters.length * missions.length;
    let completedMissionsCount = 0;
    
    characters.forEach(character => {
      missions.forEach(mission => {
        if (completedMissions[character.id]?.[mission.id]?.some(status => status)) {
          completedMissionsCount++;
        }
      });
    });
    
    return {
      total: totalMissions,
      completed: completedMissionsCount,
      percentage: Math.round((completedMissionsCount / totalMissions) * 100)
    };
  };

  if (!missions || !userChars || missions.length === 0 || userChars.length === 0) 
    {
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
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Accordion
        defaultExpanded={false}
        sx={{
          bgcolor: 'transparent',
          '&:before': {
            display: 'none',
          },
          '& .MuiAccordion-root': {
            bgcolor: 'transparent',
          },
          mb: 3,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.grey[400] }} />}
          sx={{
            bgcolor: alpha(theme.palette.grey[900], 0.7),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.grey[800], 0.3)}`,
            borderRadius: '16px',
            '&.Mui-expanded': {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: theme.palette.grey[100],
                  mb: 0.5,
                }}
              >
                Progresso Geral das Missões Diárias
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateOverallProgress().percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.grey[800], 0.5),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, 
                          ${theme.palette.primary.main}, 
                          ${theme.palette.primary.light}
                        )`,
                      },
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: theme.palette.primary.light,
                    minWidth: '45px',
                    textAlign: 'right',
                  }}
                >
                  {calculateOverallProgress().percentage}%
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                px: 3,
                py: 1,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.grey[800], 0.3),
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: theme.palette.grey[400],
                    mb: 0.5,
                  }}
                >
                  Missões Concluídas
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: theme.palette.primary.light,
                  }}
                >
                  {calculateOverallProgress().completed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '1px',
                  bgcolor: alpha(theme.palette.grey[700], 0.5),
                }}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: theme.palette.grey[400],
                    mb: 0.5,
                  }}
                >
                  Total de Missões
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: theme.palette.grey[100],
                  }}
                >
                  {calculateOverallProgress().total}
                </Typography>
              </Box>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            bgcolor: alpha(theme.palette.grey[900], 0.7),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.grey[800], 0.3)}`,
            borderTop: 'none',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {missions?.map(mission => {
              const totalAttempts = characters?.length || 0;
              const completedAttempts = characters?.reduce((acc, char) => {
                return acc + (completedMissions[char.id]?.[mission.id]?.filter(status => status)?.length || 0);
              }, 0);
              const maxPossibleAttempts = totalAttempts * (mission.max_attempts || 1);
              
              return (
                <Box
                  key={mission.id}
                  sx={{
                    flex: '1 1 200px',
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.grey[800], 0.3),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  {mission.mission_imgUrl ? (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: `linear-gradient(135deg, 
                          ${alpha(theme.palette.grey[800], 0.5)}, 
                          ${alpha(theme.palette.grey[900], 0.5)})`,
                        border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`,
                      }}
                    >
                      <img
                        src={mission.mission_imgUrl}
                        alt={mission.mission_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ) : (
                    <AssignmentTurnedInIcon sx={{ fontSize: 40, color: theme.palette.grey[600] }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.palette.grey[100],
                        mb: 0.5,
                      }}
                    >
                      {mission.mission_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: theme.palette.grey[400],
                        }}
                      >
                        {completedAttempts}/{maxPossibleAttempts}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(completedAttempts / maxPossibleAttempts) * 100}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.grey[800], 0.5),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            background: `linear-gradient(90deg, 
                              ${theme.palette.success.main}, 
                              ${theme.palette.success.light}
                            )`,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Left scroll button */}
      {showScrollButtons.left && (
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 4,
            backgroundColor: alpha(theme.palette.grey[900], 0.9),
            width: 40,
            height: 40,
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[800], 0.95),
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`,
            color: theme.palette.grey[300],
            '&:active': {
              transform: 'translateY(-50%) scale(0.95)',
            },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      )}

      {/* Right scroll button */}
      {showScrollButtons.right && (
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 4,
            backgroundColor: alpha(theme.palette.grey[900], 0.9),
            width: 40,
            height: 40,
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[800], 0.95),
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`,
            color: theme.palette.grey[300],
            '&:active': {
              transform: 'translateY(-50%) scale(0.95)',
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}

      <TableContainer
        ref={tableContainerRef}
        component={Paper}
        elevation={4}
        sx={{
          borderRadius: '16px',
          bgcolor: alpha(theme.palette.grey[900], 0.7),
          overflow: 'auto',
          maxWidth: '100%',
          height: 'calc(100vh - 140px)',
          backdropFilter: 'blur(10px)',
          '&::-webkit-scrollbar': {
            height: '6px',
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.grey[900], 0.5),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.grey[700], 0.5),
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[600], 0.6),
            },
          },
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          border: `1px solid ${alpha(theme.palette.grey[800], 0.3)}`,
        }}
      >
        <Table size="small" sx={{ minWidth: 650, background: 'transparent' }}>
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: alpha(theme.palette.grey[900], 0.7),
              backdropFilter: 'blur(10px)',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '2px',
                background: `linear-gradient(90deg, 
                  ${alpha(theme.palette.primary.main, 0.3)}, 
                  ${alpha(theme.palette.primary.light, 0.3)})`,
              },
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  bgcolor: alpha(theme.palette.grey[900], 0.7),
                  backdropFilter: 'blur(10px)',
                  padding: '12px',
                  color: theme.palette.grey[300],
                  borderBottom: 'none',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1px',
                    height: '70%',
                    background: `linear-gradient(180deg, 
                      transparent,
                      ${alpha(theme.palette.grey[500], 0.2)},
                      transparent)`,
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}>
                  Personagem
                </Typography>
              </TableCell>
              {missions.map(mission => (
                <TableCell
                  key={mission.id}
                  align="center"
                  sx={{
                    minWidth: '90px',
                    position: 'sticky',
                    top: 0,
                    bgcolor: alpha(theme.palette.grey[900], 0.7),
                    backdropFilter: 'blur(10px)',
                    zIndex: 2,
                    padding: '8px 4px',
                    borderBottom: 'none',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {mission.mission_imgUrl ? (
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: `linear-gradient(135deg, 
                            ${alpha(theme.palette.grey[800], 0.5)}, 
                            ${alpha(theme.palette.grey[900], 0.5)})`,
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          },
                        }}
                      >
                        <img
                          src={mission.mission_imgUrl}
                          alt={mission.mission_name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ) : (
                      <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: '6px' }} />
                    )}
                    <Tooltip title={mission.mission_name || ''} arrow placement="top">
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          maxWidth: '70px',
                          color: theme.palette.grey[400],
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {mission.mission_name || <Skeleton variant="text" width={50} />}
                      </Typography>
                    </Tooltip>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={characters}
                strategy={verticalListSortingStrategy}
              >
                {characters.map(character => (
                  <SortableTableRow
                    key={character.id}
                    character={character}
                    missions={missions || []}
                    completedMissions={completedMissions}
                    handleCheckbox={handleCheckbox}
                    loading={loading}
                    loadingStates={loadingStates}
                    calculateProgress={calculateProgress}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MissionControlTable;
