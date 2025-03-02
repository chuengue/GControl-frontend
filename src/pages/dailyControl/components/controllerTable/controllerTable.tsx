import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DragHandle } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Accordion, AccordionDetails, AccordionSummary, alpha, Box, Checkbox, CircularProgress, IconButton, LinearProgress, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import theme from '../../../../../theme';
import { UserCharacter } from '../../../../interfaces/char';
import { registerCompletedMission, removeRegisterCompletedMission } from '../../../../service/requests/limitedMissions/limitedMissions';
import { CharacterMissions, MissionResult } from '../../../../service/requests/limitedMissions/types';
import { useSession } from '../../../../SessionContext';
import { useSnackbarStore } from '../../../../stores/snackBarStore';
import { handleTableDownload } from '../../../../utils/tableDownload';
import { styles } from './styles';

interface Props {
  missions: MissionResult[] | undefined;
  UserCharsLogs: CharacterMissions[] | undefined;
  userChars: UserCharacter[] | undefined;
  refetchData: () => Promise<void>;
}

interface SortableTableRowProps {
  character: UserCharacter;
  missions: MissionResult[];
  completedMissions: Record<string, Record<string, boolean[]>>;
  handleCheckbox: (
    characterId: string,
    missionId: string,
    attemptIndex: number,
    completed: boolean
  ) => Promise<void>;
  loading: boolean | undefined;
  loadingStates: Record<string, boolean>;
  calculateProgress: (characterId: string) => number;
  torreFloors: Record<string, number>;
  handleFloorChange: (characterId: string, floor: number) => void;
}

// Sortable Row Component
const SortableTableRow = ({
  character,
  missions,
  completedMissions,
  handleCheckbox,
  loading,
  loadingStates,
  calculateProgress,
  torreFloors,
  handleFloorChange
}: SortableTableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: character.id
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as 'relative',
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      sx={{
        '&:hover': {
          bgcolor: alpha(theme.palette.grey[800], 0.3)
        },
        transition: 'background-color 0.2s ease'
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
          bgcolor: alpha(theme.palette.grey[900], 0.95),
          backdropFilter: 'blur(10px)',
          '&:hover': {
            bgcolor: alpha(theme.palette.grey[800], 0.95)
          },
          borderRight: `1px solid ${alpha(theme.palette.grey[700], 0.2)}`,
          '&::after': {
            content: '""',
            position: 'absolute',
            right: -1,
            top: 0,
            height: '100%',
            width: '1px',
            background: `linear-gradient(180deg, 
              transparent,
              ${alpha(theme.palette.primary.main, 0.1)} 30%,
              ${alpha(theme.palette.primary.main, 0.1)} 70%,
              transparent
            )`
          }
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
                  transition: 'opacity 0.2s ease'
                },
                '&:hover::after': {
                  opacity: 1
                }
              }}
            >
              <img
                src={character.gameChar.thumbImgUrl}
                alt={character.gameChar.name}
                width={38}
                style={{
                  borderRadius: '6px',
                  border: `2px solid ${alpha(theme.palette.grey[700], 0.3)}`
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
                        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
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
            bgcolor: alpha(theme.palette.grey[900], 0.3)
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
                bgcolor: alpha(theme.palette.grey[800], 0.3)
              }
            }}
          >
            {mission.mission_name === 'Torre das Ilusões' ? (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}
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
                        justifyContent: 'center'
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress
                          size={16}
                          thickness={6}
                          sx={{
                            color: completed ? theme.palette.success.main : theme.palette.grey[400]
                          }}
                        />
                      ) : (
                        <Checkbox
                          color="success"
                          disabled={loading || isLoading}
                          checked={completed}
                          onChange={() =>
                            handleCheckbox(character.id, mission.id, index, completed)
                          }
                          sx={{
                            padding: '1px',
                            opacity: isLoading ? 0.5 : 1,
                            transition: 'all 0.2s ease',
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.1rem'
                            },
                            '&.Mui-checked': {
                              color: theme.palette.success.main,
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                              borderRadius: '4px'
                            },
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              borderRadius: '4px'
                            },
                            '&.Mui-disabled': {
                              cursor: isLoading ? 'wait' : 'not-allowed',
                              opacity: 0.5
                            }
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
                <Tooltip title="Andar atual" arrow placement="top">
                  <TextField
                    type="number"
                    size="small"
                    value={torreFloors[character.id] || ''}
                    onChange={e =>
                      handleFloorChange(
                        character.id,
                        Math.max(1, Math.min(50, Number(e.target.value))))
                    }
                    inputProps={{
                      min: 1,
                      max: 30,
                      style: {
                        padding: '2px 4px',
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        color: theme.palette.grey[300]
                      }
                    }}
                    sx={{
                      width: '40px',
                      '& .MuiOutlinedInput-root': {
                        height: '22px',
                        bgcolor: alpha(theme.palette.grey[800], 0.3),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.grey[800], 0.5)
                        },
                        '& fieldset': {
                          borderColor: alpha(theme.palette.grey[600], 0.3),
                          borderWidth: '1px'
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(theme.palette.grey[500], 0.5)
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: '1px'
                        }
                      }
                    }}
                  />
                </Tooltip>
              </Box>
            ) : (
              completedMissions[character.id]?.[mission.id]?.map((completed, index) => {
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
                      justifyContent: 'center'
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress
                        size={16}
                        thickness={6}
                        sx={{
                          color: completed ? theme.palette.success.main : theme.palette.grey[400]
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
                            fontSize: '1.1rem'
                          },
                          '&.Mui-checked': {
                            color: theme.palette.success.main,
                            bgcolor: alpha(theme.palette.success.main, 0.15),
                            borderRadius: '4px'
                          },
                          '&:hover': {
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            borderRadius: '4px'
                          },
                          '&.Mui-disabled': {
                            cursor: isLoading ? 'wait' : 'not-allowed',
                            opacity: 0.5
                          }
                        }}
                      />
                    )}
                  </Box>
                );
              }) || (
                <Skeleton
                  variant="rectangular"
                  width={20}
                  height={20}
                  sx={{ borderRadius: '4px' }}
                />
              )
            )}
          </Box>
        </TableCell>
      ))}
    </TableRow>
  );
};

const MissionControlTable: React.FC<Props> = ({ missions, UserCharsLogs, userChars, refetchData }) => {
  const [completedMissions, setCompletedMissions] = useState<
    Record<string, Record<string, boolean[]>>
  >({});
  const { session } = useSession();
  const [loading, setLoading] = useState<boolean>();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { showSnackbar } = useSnackbarStore();
  const [characters, setCharacters] = useState(userChars || []);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [nextReset, setNextReset] = useState<string>('');

  // Add state for Torre das Ilusões floors
  const [torreFloors, setTorreFloors] = useState<Record<string, number>>({});

  // Auto-refresh interval (1 hour in milliseconds)
  const REFRESH_INTERVAL = 60 * 60 * 1000;

  // Adicionar ref para controlar montagem inicial
  const isInitialMount = useRef(true);

  // Função para refresh dos dados
  const refreshData = useCallback(async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      await refetchData();
      showSnackbar('Dados atualizados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showSnackbar('Erro ao atualizar dados', 'error');
    } finally {
      setLoading(false);
    }
  }, [session, refetchData, showSnackbar]);

  // Efeito para inicializar os dados quando o componente montar
  useEffect(() => {
    if (!missions || !UserCharsLogs || !userChars) return;

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

  // Set up auto-refresh interval
  useEffect(() => {
    // Não fazer o refresh inicial automático
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshData]);

  // Load Torre das Ilusões floors from localStorage
  useEffect(() => {
    const savedFloors = localStorage.getItem('torreFloors');
    if (savedFloors) {
      setTorreFloors(JSON.parse(savedFloors));
    }
  }, []);

  // Function to update floor for a character
  const handleFloorChange = (characterId: string, floor: number) => {
    const newFloors = {
      ...torreFloors,
      [characterId]: floor
    };
    setTorreFloors(newFloors);
    localStorage.setItem('torreFloors', JSON.stringify(newFloors));
  };

  // Mission order priority map
  const missionOrderPriority = {
    'Terra do Julgamento': 1,
    'Fornalha Infernal': 2,
    'Altar da Ruína': 3,
    'Covil de Berkas': 4,
    'Torre da Extinção': 5,
    'Torre das Ilusões': 6,
    'Cerco de Teroka': 7,
    'Templo do Tempo': 8,
    'A Grande Explosão de Calnat': 9,
    'Caminho Abissal': 10,
    'Claustro do Infinito': 11,
    'Vazio (Invasão)': 12,
    'Vazio (Contaminação)': 13,
    'Vazio (Pesadelo)': 14
  };

  // Function to check if Terra do Julgamento should be displayed
  const shouldShowTerraDoJulgamento = () => {
    // Get current time in Brasília timezone
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const day = brasiliaTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
    const hours = brasiliaTime.getHours();

    // Show from Friday 3 AM to Monday 3 AM
    if (day === 5 && hours >= 3) return true; // Friday after 3 AM
    if (day === 6) return true; // Saturday all day
    if (day === 0) return true; // Sunday all day
    if (day === 1 && hours < 3) return true; // Monday before 3 AM

    return false;
  };

  // Sort missions function
  const sortMissions = missionsArray => {
    // Filter out Terra do Julgamento if it shouldn't be shown
    const filteredMissions = missionsArray.filter(mission => {
      if (mission.mission_name === 'Terra do Julgamento') {
        return shouldShowTerraDoJulgamento();
      }
      return true;
    });

    return [...filteredMissions].sort((a, b) => {
      // First priority: Epic type
      if (a.type === 'epic' && b.type !== 'epic') return -1;
      if (a.type !== 'epic' && b.type === 'epic') return 1;

      // Second priority: Specific order for named missions
      const priorityA = missionOrderPriority[a.mission_name] || 999;
      const priorityB = missionOrderPriority[b.mission_name] || 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If neither mission is in the priority list, sort alphabetically
      return a.mission_name.localeCompare(b.mission_name);
    });
  };

  // Sort missions before rendering
  const sortedMissions = missions ? sortMissions(missions) : [];

  // Load order from localStorage
  useEffect(() => {
    if (!userChars) return;

    const savedOrder = localStorage.getItem('characterOrder');
    if (savedOrder) {
      const orderIds = JSON.parse(savedOrder);
      const orderedChars = orderIds
        .map(id => userChars.find(char => char.id === id))
        .filter(Boolean);
      const remainingChars = userChars.filter(char => !orderIds.includes(char.id));
      setCharacters([...orderedChars, ...remainingChars]);
    } else {
      setCharacters(userChars);
    }
  }, [userChars]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = event => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCharacters(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        // Save order to localStorage
        localStorage.setItem('characterOrder', JSON.stringify(newOrder.map(char => char.id)));

        return newOrder;
      });
    }
  };

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
  const handleCheckbox = async (
    characterId: string,
    missionId: string,
    attemptIndex: number,
    completed: boolean
  ) => {
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

  const handleDownload = () => {
    handleTableDownload(tableRef);
  };

  // Função para calcular tempo até próximo reset
  const calculateNextReset = useCallback(() => {
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const nextReset = new Date(brasiliaTime);
    
    nextReset.setHours(3, 0, 0, 0);
    if (brasiliaTime.getHours() >= 3) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    const diff = nextReset.getTime() - brasiliaTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }, []);

  // Atualizar contador a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setNextReset(calculateNextReset());
    }, 60000);

    setNextReset(calculateNextReset());
    return () => clearInterval(timer);
  }, [calculateNextReset]);



  // Função para identificar missões pendentes
  const getPendingMissions = () => {
    if (!characters || !missions) return [];

    return missions.filter(mission =>
      characters.some(char =>
        !completedMissions[char.id]?.[mission.id]?.some(status => status)
      )
    );
  };

  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false
  });

  // Function to check if scroll buttons should be shown
  const checkScrollButtons = useCallback(() => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth
      });
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      // Check on window resize
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons]);

  // Scroll functions
  const handleScroll = (direction: 'left' | 'right') => {
    if (tableContainerRef.current) {
      const scrollAmount = 300; // Adjust this value to change scroll distance
      const currentScroll = tableContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;
      
      tableContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
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
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2,
        mb: 3 
      }}>
        {/* Header with Reset Timer and Download Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}>
            <AccessTimeIcon sx={{ color: theme.palette.warning.main }} />
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ color: theme.palette.grey[300], fontSize: '0.75rem' }}>
                    Reset do servidor às
                  </Typography>
                  <Typography sx={{ 
                    color: theme.palette.warning.light, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                    px: 0.8,
                    py: 0.2,
                    borderRadius: '4px'
                  }}>
                    03:00
                  </Typography>
                  <Typography sx={{ 
                    color: theme.palette.warning.main, 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    ml: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    {nextReset}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  color: theme.palette.grey[400], 
                  fontSize: '0.7rem',
                  fontStyle: 'italic'
                }}>
                  Missões diárias e tabela de controle resetam automaticamente
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={refreshData}
              disabled={loading}
              sx={{
                ...styles.downloadButton,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: alpha(theme.palette.primary.main, 0.2),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
                {loading ? (
                  <CircularProgress
                    size={20}
                    thickness={5}
                    sx={{ color: theme.palette.primary.main }}
                  />
                ) : (
                  <RefreshIcon sx={{ 
                    fontSize: 20,
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': {
                        transform: 'rotate(0deg)',
                      },
                      '100%': {
                        transform: 'rotate(360deg)',
                      },
                    },
                  }} />
                )}
                <Typography 
                  variant="button" 
                  sx={{ 
                    fontSize: '0.8rem',
                    color: theme.palette.primary.main
                  }}
                >
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Typography>
              </Box>
            </IconButton>

            <IconButton onClick={handleDownload} sx={styles.downloadButton}>
              <DownloadIcon sx={{ fontSize: 20 }} />
              <Typography variant="button" sx={{ fontSize: '0.8rem' }}>
                Baixar Tabela
              </Typography>
            </IconButton>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 2
        }}>
         

          {/* Pending Missions Card */}
          <Paper sx={{ 
            p: 2,
            bgcolor: getPendingMissions().length === 0 
              ? alpha(theme.palette.success.main, 0.1)
              : alpha(theme.palette.error.main, 0.1),
            border: `1px solid ${getPendingMissions().length === 0 
              ? alpha(theme.palette.success.main, 0.2)
              : alpha(theme.palette.error.main, 0.2)}`,
            borderRadius: '12px'
          }}>
            {getPendingMissions().length === 0 ? (
              // Card quando não há missões pendentes
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                py: 1
              }}>
                <AssignmentTurnedInIcon 
                  sx={{ 
                    color: theme.palette.success.main,
                    fontSize: '2rem'
                  }} 
                />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="success.main" sx={{ fontSize: '0.9rem', fontWeight: 'bold', mb: 0.5 }}>
                    Todas as Missões Completadas!
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.grey[400],
                      display: 'block'
                    }}
                  >
                    Parabéns! Você completou todas as missões diárias.
                  </Typography>
                </Box>
              </Box>
            ) : (
              // Card original para missões pendentes
              <>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2 
                }}>
                  <AssignmentTurnedInIcon 
                    sx={{ 
                      color: theme.palette.error.main,
                      fontSize: '1.2rem'
                    }} 
                  />
                  <Typography variant="subtitle2" color="error.main" sx={{ fontSize: '0.85rem' }}>
                    Missões Pendentes
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.grey[400],
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      px: 1,
                      py: 0.2,
                      borderRadius: '10px',
                      fontSize: '0.7rem'
                    }}
                  >
                    {getPendingMissions().length} missões
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 1
                }}>
                  {getPendingMissions().map((mission, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 0.8,
                        gap: 1,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        cursor: 'help',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          transform: 'translateY(-1px)',
                          '& .hover-info': {
                            opacity: 1
                          }
                        },
                        '&::after': {
                          content: '"..."',
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: theme.palette.error.light,
                          fontSize: '0.7rem',
                          opacity: 0.7
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: theme.palette.error.main,
                          boxShadow: `0 0 6px ${alpha(theme.palette.error.main, 0.5)}`,
                          flexShrink: 0
                        }}
                      />
                      <Tooltip 
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {mission.mission_name}
                            </Typography>
                            <Typography variant="body2">
                              Personagens pendentes:
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              {characters.filter(char => 
                                !completedMissions[char.id]?.[mission.id]?.some(status => status)
                              ).map(char => (
                                <Typography key={char.id} variant="body2" sx={{ color: 'error.light' }}>
                                  • {char.gameChar.name}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        }
                        arrow 
                        placement="top"
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="caption" 
                            color="grey.300"
                            sx={{ 
                              fontSize: '0.75rem',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              paddingRight: '16px'
                            }}
                          >
                            {mission.mission_name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.error.light,
                              fontSize: '0.70rem'
                            }}
                          >
                            {characters.filter(char => 
                              !completedMissions[char.id]?.[mission.id]?.some(status => status)
                            ).length} personagens
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Box>

      <Accordion
        defaultExpanded={false}
        sx={{
          bgcolor: 'transparent',
          borderRadius: '16px',

          '&:before': {
            display: 'none'
          },
          '& .MuiAccordion-root': {
            bgcolor: 'transparent'
          },
          mb: 3
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
              borderBottomRightRadius: 0
            },
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 1
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: theme.palette.grey[100],
                  mb: 0.5
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
                        )`
                      }
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: theme.palette.primary.light,
                    minWidth: '45px',
                    textAlign: 'right'
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
                bgcolor: alpha(theme.palette.grey[800], 0.3)
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: theme.palette.grey[400],
                    mb: 0.5
                  }}
                >
                  Missões Concluídas
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: theme.palette.primary.light
                  }}
                >
                  {calculateOverallProgress().completed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '1px',
                  bgcolor: alpha(theme.palette.grey[700], 0.5)
                }}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: theme.palette.grey[400],
                    mb: 0.5
                  }}
                >
                  Total de Missões
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: theme.palette.grey[100]
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
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {sortedMissions.map(mission => {
              const totalAttempts = characters?.length || 0;
              const completedAttempts = characters?.reduce((acc, char) => {
                return (
                  acc +
                  (completedMissions[char.id]?.[mission.id]?.filter(status => status)?.length || 0)
                );
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
                    gap: 2
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
                        border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`
                      }}
                    >
                      <img
                        src={mission.mission_imgUrl}
                        alt={mission.mission_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
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
                        mb: 0.5
                      }}
                    >
                      {mission.mission_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: theme.palette.grey[400]
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
                            )`
                          }
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


      <Box sx={{ position: 'relative' }}>
        {/* Left scroll button */}
        {showScrollButtons.left && (
          <IconButton
            onClick={() => handleScroll('left')}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: alpha(theme.palette.grey[900], 0.8),
              backdropFilter: 'blur(4px)',
              border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[800], 0.9),
              },
              width: 40,
              height: 40,
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
            }}
          >
            <ChevronLeftIcon sx={{ color: theme.palette.grey[300] }} />
          </IconButton>
        )}

        {/* Right scroll button */}
        {showScrollButtons.right && (
          <IconButton
            onClick={() => handleScroll('right')}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: alpha(theme.palette.grey[900], 0.8),
              backdropFilter: 'blur(4px)',
              border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[800], 0.9),
              },
              width: 40,
              height: 40,
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
            }}
          >
            <ChevronRightIcon sx={{ color: theme.palette.grey[300] }} />
          </IconButton>
        )}

        <TableContainer
          ref={tableContainerRef}
          component={Paper}
          elevation={4}
          sx={{
            ...styles.tableContainer,
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.grey[900], 0.5),
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.grey[700], 0.5),
              borderRadius: 3,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[600], 0.5),
              },
            },
          }}
        >
          <Table 
            ref={tableRef} 
            size="small" 
            component="table"
            sx={{ minWidth: 650, background: 'transparent' }}
          >
            <TableHead sx={styles.tableHead}>
              <TableRow>
                <TableCell sx={styles.stickyCell}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}
                  >
                    Personagem
                  </Typography>
                </TableCell>
                {sortedMissions.map(mission => (
                  <TableCell
                    key={mission.id}
                    align="center"
                    sx={styles.headerCell}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
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
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                            }
                          }}
                        >
                          <img
                            src={mission.mission_imgUrl}
                            alt={mission.mission_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      ) : (
                        <Skeleton
                          variant="rectangular"
                          width={28}
                          height={28}
                          sx={{ borderRadius: '6px' }}
                        />
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
                            letterSpacing: '0.5px'
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
                <SortableContext items={characters} strategy={verticalListSortingStrategy}>
                  {characters.map(character => (
                    <SortableTableRow
                      key={character.id}
                      character={character}
                      missions={sortedMissions}
                      completedMissions={completedMissions}
                      handleCheckbox={handleCheckbox}
                      loading={loading}
                      loadingStates={loadingStates}
                      calculateProgress={calculateProgress}
                      torreFloors={torreFloors}
                      handleFloorChange={handleFloorChange}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default MissionControlTable;
