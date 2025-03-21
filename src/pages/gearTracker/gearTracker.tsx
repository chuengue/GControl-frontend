import { Add, Remove, SwapHoriz } from '@mui/icons-material';
import { alpha, Box, Card, Chip, CircularProgress, Dialog, DialogContent, Fade, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Skeleton, Stack, Tab, Tabs, Tooltip, Typography, useTheme } from '@mui/material';
import { blue, green, purple, red } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import EmptyState from '../../components/emptyState/emptyState';
import SelectableImage from '../../components/selectableImage/selectableImage';
import { UserCharacter } from '../../interfaces/char';
import { allOptionsForEquippedItems, raritiesOptions } from '../../pages/admin/consts';
import { getUserCharDetails } from '../../service/requests/gameChar';
import { addItemToInventory, equipItem, unequipItem } from '../../service/requests/inventory';
import { getEquipmentSet } from '../../service/requests/sets/sets';
import { EquipmentSet } from '../../service/requests/sets/types';
import { useSession } from '../../SessionContext';
import Inventory from '../../shared/components/inventory/inventory';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';
import { capitalizeWords, formatNumberWithThousands } from '../../utils/utils.ts';
import { AccessoryType, EquipmentType } from '../admin/types.ts';

interface EquippedItem {
  id: string;
  name: string;
  category: 'equipment' | 'accessory';
  rarity: string;
  stats: {
    attack: number;
    defense: number;
    hp: number;
  };
  setName?: string;
  armorType?: EquipmentType;
  accessoryType?: AccessoryType;
}

interface CharacterSummary {
  name: string;
  level: number;
  atkTotal: number;
  sets: Map<string, number>;
}

const GearTrackerPage = () => {
  const { userChars, fetchUserCharsData, fetchUserItems, userItems } = useCharStore();
  const { session } = useSession();
  const { showSnackbar } = useSnackbarStore();
  const [selectedChar, setSelectedChar] = useState<UserCharacter | null>(null);
  const [userCharDetails, setUserCharDetails] = useState<any>(null);
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ type: string; slot: string } | null>(null);
  const [allCharsSummary, setAllCharsSummary] = useState<CharacterSummary[]>([]);
  const [equipmentSets, setEquipmentSets] = useState<EquipmentSet[]>([]);
  const navigate = useNavigate();
  const { charId } = useParams();
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFarmingChars, setSelectedFarmingChars] = useState<number>(1);
  const [selectedPieces, setSelectedPieces] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [equipLoading, setEquipLoading] = useState<boolean>(false);
  const [unequipLoading, setUnequipLoading] = useState<string | null>(null);

  // Constantes para o cálculo do farming
  const REQUIRED_MATERIALS = {
    vulcanos: 12,
    nemophilla: 12,
    grandiel: 18,
    epicCoins: 40,
    gp: 1000000
  };

  const DAILY_MATERIALS = {
    vulcanos: 4,
    nemophilla: 4,
    grandiel: 6
  };

  const calculateFarmingDays = (numChars: number, numPieces: number) => {
    const totalVulcanos = REQUIRED_MATERIALS.vulcanos * numPieces;
    const totalNemophilla = REQUIRED_MATERIALS.nemophilla * numPieces;
    const totalGrandiel = REQUIRED_MATERIALS.grandiel * numPieces;

    const daysForVulcanos = Math.ceil(totalVulcanos / (DAILY_MATERIALS.vulcanos * numChars));
    const daysForNemophilla = Math.ceil(totalNemophilla / (DAILY_MATERIALS.nemophilla * numChars));
    const daysForGrandiel = Math.ceil(totalGrandiel / (DAILY_MATERIALS.grandiel * numChars));

    return {
      maxDays: Math.max(daysForVulcanos, daysForNemophilla, daysForGrandiel),
      vulcanosDays: daysForVulcanos,
      nemophillaDays: daysForNemophilla,
      grandielDays: daysForGrandiel,
      totalMaterials: {
        vulcanos: totalVulcanos,
        nemophilla: totalNemophilla,
        grandiel: totalGrandiel,
        epicCoins: REQUIRED_MATERIALS.epicCoins * numPieces,
        gp: REQUIRED_MATERIALS.gp * numPieces
      }
    };
  };

  useEffect(() => {
    if (session?.user.uid) {
      setIsLoading(true);
      fetchUserCharsData(session.user.uid).finally(() => {
        setIsLoading(false);
      });
    }
  }, [session?.user.uid]);

  useEffect(() => {
    if (userChars.length > 0) {
      if (charId) {
        const char = userChars.find(c => c.id === charId);
        if (char) {
          setSelectedChar(char);
        }
      } else {
        // Se não houver charId na URL, seleciona o primeiro personagem
        const firstChar = userChars[0];
        setSelectedChar(firstChar);
        navigate(`/gear-tracker/${firstChar.gameChar.id}`);
      }
    }
  }, [userChars, charId]);

  useEffect(() => {
    if (selectedChar?.id) {
      fetchUserItems(selectedChar.id);
    }
  }, [selectedChar?.id]); // Executa quando o personagem selecionado muda

  useEffect(() => {
    const fetchCharDetails = async () => {
      if (session?.user.uid && selectedChar?.id) {
        try {
          setIsLoadingDetails(true);
          const details = await getUserCharDetails(session.user.uid, selectedChar.id);
          setUserCharDetails(details);
        } catch (error) {
          console.error('Error fetching char details:', error);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchCharDetails();
  }, [session?.user.uid, selectedChar]);

  useEffect(() => {
    const fetchAllCharsSummary = async () => {
      if (!session?.user.uid || !userChars.length) return;

      const summaries = await Promise.all(
        userChars.map(async char => {
          try {
            const details = await getUserCharDetails(session.user.uid, char.id);
            const equippedSets = new Map<string, number>();

            details.results.gameChar.equippedItems.forEach(item => {
              if (item.setName) {
                equippedSets.set(item.setName, (equippedSets.get(item.setName) || 0) + 1);
              }
            });

            return {
              name: char.gameChar.name,
              level: details.results.level,
              atkTotal: details.results.atkTotal,
              sets: equippedSets
            };
          } catch (error) {
            console.error(`Error fetching details for ${char.gameChar.name}:`, error);
            return null;
          }
        })
      );

      setAllCharsSummary(summaries.filter(Boolean) as CharacterSummary[]);
    };

    fetchAllCharsSummary();
  }, [session?.user.uid, userChars]);

  useEffect(() => {
    const fetchEquipmentSets = async () => {
      try {
        const response = await getEquipmentSet();
        setEquipmentSets(response.data);
      } catch (error) {
        console.error('Error fetching equipment sets:', error);
      }
    };
    fetchEquipmentSets();
  }, []);

  const handleSelectChar = (char: UserCharacter) => {
    if (char.id === selectedChar?.id) {
      setSelectedChar(null);
      setUserCharDetails(null);
      navigate('/gear-tracker');
    } else {
      setSelectedChar(char);
      navigate(`/gear-tracker/${char.gameChar.id}`);
    }
  };

  const calculateSetSummary = () => {
    if (!userCharDetails?.results?.gameChar?.equippedItems) return new Map<string, number>();

    const equippedSets = new Map<string, number>();

    userCharDetails.results.gameChar.equippedItems.forEach((item: EquippedItem) => {
      if (item.setName) {
        equippedSets.set(item.setName, (equippedSets.get(item.setName) || 0) + 1);
      }
    });

    return equippedSets;
  };

  const getRarityLabel = (rarity: string) => {
    return raritiesOptions.find(r => r.value === rarity.toLowerCase())?.label || rarity;
  };

  const getSlotLabel = (slot: string) => {
    return allOptionsForEquippedItems.find(item => item.value === slot)?.label || slot;
  };

  const organizeEquipmentBySlot = () => {
    if (!userCharDetails?.results?.gameChar?.equippedItems) return {};

    const organized = allOptionsForEquippedItems.reduce(
      (acc, slot) => {
        acc[slot.value] = null;
        return acc;
      },
      {} as Record<string, EquippedItem | null>
    );

    userCharDetails.results.gameChar.equippedItems.forEach((item: EquippedItem) => {
      const slotKey = item.armorType || item.accessoryType;
      if (slotKey) {
        organized[slotKey] = item;
      }
    });

    return organized;
  };

  const handleMoveAndEquipItem = async (item: { id: string }) => {
    if (!selectedChar?.id || !session?.user?.uid) {
      showSnackbar('Selecione um personagem primeiro', 'warning');
      return;
    }
    try {
      setEquipLoading(true);
      const existingItem = userItems.find(invItem => invItem.id === item.id);

      // Adiciona o item ao inventário se não existir
      if (!existingItem) {
        await addItemToInventory(selectedChar.id, {
          itemId: item.id,
          quantity: 1,
          equipped: false
        });
      }

      // Atualiza a lista de itens e usa o estado atualizado da store
      const updatedItems = await fetchUserItems(selectedChar.id);
      const movedItem = updatedItems.find(invItem => invItem.id === item.id);

      if (!movedItem?.userInventoryItemId) {
        throw new Error('Item não encontrado após ser movido');
      }

      // Equipa o item
      await equipItem(selectedChar.id, movedItem.userInventoryItemId);

      // Atualiza os detalhes do personagem
      const updatedDetails = await getUserCharDetails(session.user.uid, selectedChar.id);
      setUserCharDetails(updatedDetails);
      setIsEquipModalOpen(false);

      showSnackbar('Item movido e equipado com sucesso', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao mover e equipar item';
      showSnackbar(errorMessage, 'error');
      console.error('Error moving and equipping item:', error);
    } finally {
      setEquipLoading(false);
    }
  };

  const handleUnequipItem = async (item: EquippedItem) => {
    if (!selectedChar?.id || !session?.user?.uid) {
      showSnackbar('Selecione um personagem primeiro', 'warning');
      return;
    }

    try {
      setUnequipLoading(item.id);
      const inventoryItem = userItems.find(invItem => invItem.id === item.id);

      if (!inventoryItem?.userInventoryItemId) {
        throw new Error('Item não encontrado no inventário');
      }

      await unequipItem(selectedChar.id, inventoryItem.userInventoryItemId);
      const updatedDetails = await getUserCharDetails(session.user.uid, selectedChar.id);
      setUserCharDetails(updatedDetails);
      showSnackbar('Item desequipado com sucesso', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao desequipar item';
      showSnackbar(errorMessage, 'error');
      console.error('Error unequipping item:', error);
    } finally {
      setUnequipLoading(null);
    }
  };

  const handleOpenEquipModal = (type: 'equipment' | 'accessory', slot: string) => {
    setSelectedSlot({ type, slot });
    setIsEquipModalOpen(true);
  };


  const renderEquipmentGrid = () => (
    <Grid container spacing={2}>
      {/* Coluna de Equipamentos */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" color="white" gutterBottom sx={{ pl: 1, fontFamily: 'faktos' }}>
          Equipamentos
        </Typography>
        <Stack spacing={1}>
          {['weapon', 'helmet', 'upper', 'lower', 'gloves', 'shoes', 'cloak'].map(slot => {
            const item = Object.entries(organizeEquipmentBySlot()).find(
              ([key, value]) => key === slot
            )?.[1];

            const itemRarity = item?.rarity || '';
            const rarityColor =
              theme.palette.raritiesColors[
                itemRarity as keyof typeof theme.palette.raritiesColors
              ] || blue[400];

            return (
              <Box
                key={slot}
                sx={{
                  p: 2,
                  bgcolor: item ? alpha(rarityColor, 0.1) : alpha(blue[900], 0.2),
                  borderRadius: 2,
                  border: item
                    ? `1px solid ${alpha(rarityColor, 0.3)}`
                    : `1px solid ${alpha(blue[400], 0.1)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: item ? alpha(rarityColor, 0.2) : alpha(blue[900], 0.3),
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography color="white" variant="body1">
                    {getSlotLabel(slot)}
                  </Typography>
                  {item && (
                    <>
                      {item.setName && (
                        <Chip
                          label={capitalizeWords(
                            equipmentSets.find(set => set.id === item.setName)?.name || ''
                          )}
                          size="small"
                          sx={{
                            bgcolor: alpha(rarityColor, 0.2),
                            color: 'white',
                            border: `1px solid ${alpha(rarityColor, 0.3)}`
                          }}
                        />
                      )}
                      <Chip
                        label={getRarityLabel(item.rarity)}
                        size="small"
                        sx={{
                          bgcolor: 'transparent',
                          color: rarityColor,
                          border: `1px solid ${alpha(rarityColor, 0.5)}`
                        }}
                      />
                    </>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  {item && (
                    <Tooltip title="Desequipar">
                      <IconButton
                        size="small"
                        onClick={() => handleUnequipItem(item)}
                        disabled={unequipLoading === item.id}
                        sx={{
                          color: 'white',
                          '&:hover': {
                            bgcolor: alpha(rarityColor, 0.2)
                          }
                        }}
                      >
                        {unequipLoading === item.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Remove />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={item ? 'Trocar Item' : 'Equipar'}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEquipModal('equipment', slot)}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          bgcolor: alpha(rarityColor, 0.2)
                        }
                      }}
                    >
                      {item ? <SwapHoriz /> : <Add />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Grid>

      {/* Coluna de Acessórios */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" color="white" gutterBottom sx={{ pl: 1, fontFamily: 'faktos' }}>
          Acessórios
        </Typography>
        <Stack spacing={1}>
          {[
            'earring',
            'piercing',
            'upper_head',
            'lower_head',
            'upper_armor_ornament',
            'lower_armor_ornament',
            'arm_ornament'
          ].map(slot => {
            const item = Object.entries(organizeEquipmentBySlot()).find(
              ([key, value]) => key === slot
            )?.[1];

            const itemRarity = item?.rarity || '';
            const rarityColor =
              theme.palette.raritiesColors[
                itemRarity as keyof typeof theme.palette.raritiesColors
              ] || blue[400];

            return (
              <Box
                key={slot}
                sx={{
                  p: 2,
                  bgcolor: item ? alpha(rarityColor, 0.1) : alpha(blue[900], 0.2),
                  borderRadius: 2,
                  border: item
                    ? `1px solid ${alpha(rarityColor, 0.3)}`
                    : `1px solid ${alpha(blue[400], 0.1)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: item ? alpha(rarityColor, 0.2) : alpha(blue[900], 0.3),
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography color="white" variant="body1">
                    {getSlotLabel(slot)}
                  </Typography>
                  {item && (
                    <>
                      {item.setName && (
                        <Chip
                          label={capitalizeWords(
                            equipmentSets.find(set => set.id === item.setName)?.name || ''
                          )}
                          size="small"
                          sx={{
                            bgcolor: alpha(rarityColor, 0.2),
                            color: 'white',
                            border: `1px solid ${alpha(rarityColor, 0.3)}`
                          }}
                        />
                      )}
                      <Chip
                        label={getRarityLabel(item.rarity)}
                        size="small"
                        sx={{
                          bgcolor: 'transparent',
                          color: rarityColor,
                          border: `1px solid ${alpha(rarityColor, 0.5)}`
                        }}
                      />
                    </>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  {item && (
                    <Tooltip title="Desequipar">
                      <IconButton
                        size="small"
                        onClick={() => handleUnequipItem(item)}
                        disabled={unequipLoading === item.id}
                        sx={{
                          color: 'white',
                          '&:hover': {
                            bgcolor: alpha(rarityColor, 0.2)
                          }
                        }}
                      >
                        {unequipLoading === item.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Remove />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={item ? 'Trocar Item' : 'Equipar'}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEquipModal('accessory', slot)}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          bgcolor: alpha(rarityColor, 0.2)
                        }
                      }}
                    >
                      {item ? <SwapHoriz /> : <Add />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Grid>
    </Grid>
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderGlobalSetSummary = () => {
    // Agrupar sets por nome
    const setGroups = new Map<
      string,
      {
        total: number;
        complete: number;
        partial: number;
        completeChars: string[];
        partialChars: string[];
      }
    >();

    // Primeiro, vamos coletar todos os sets em uso
    userChars.forEach(char => {
      const charDetails = allCharsSummary.find(summary => summary.name === char.gameChar.name);
      if (charDetails) {
        charDetails.sets.forEach((count, setId) => {
          const setInfo = equipmentSets.find(set => set.id === setId);
          if (setInfo) {
            const group = setGroups.get(setId) || {
              total: 0,
              complete: 0,
              partial: 0,
              completeChars: [],
              partialChars: []
            };
            if (count === setInfo.totalPieces) {
              group.complete++;
              group.completeChars.push(charDetails.name);
            } else if (count > 0) {
              group.partial++;
              group.partialChars.push(charDetails.name);
            }
            group.total++;
            setGroups.set(setId, group);
          }
        });
      }
    });

    // Filtrar apenas sets que têm pelo menos um personagem usando
    const usedSets = Array.from(setGroups.entries()).filter(
      ([_, stats]) => stats.complete > 0 || stats.partial > 0
    );

    // Ordenar sets por número de personagens com set completo
    usedSets.sort((a, b) => {
      // Primeiro por sets completos
      if (b[1].complete !== a[1].complete) {
        return b[1].complete - a[1].complete;
      }
      // Depois por sets parciais
      return b[1].partial - a[1].partial;
    });

    return (
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h5"
          color="white"
          gutterBottom
          fontFamily="faktos"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          Sets em Uso
        </Typography>
        <Grid container spacing={3}>
          {usedSets.map(([setId, stats]) => {
            const setInfo = equipmentSets.find(set => set.id === setId);
            if (!setInfo) return null;

            return (
              <Grid item xs={12} sm={6} md={4} key={setId}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: alpha(blue[900], 0.9),
                    borderRadius: '12px',
                    border: `1px solid ${alpha(theme.palette.raritiesColors[setInfo.rarity], 0.3)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.raritiesColors[setInfo.rarity], 0.2)}`
                    }
                  }}
                >
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between">

                  <Typography
                    variant="h6"
                    color={theme.palette.raritiesColors[setInfo.rarity]}
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: `0 0 10px ${alpha(theme.palette.raritiesColors[setInfo.rarity], 0.3)}`
                    }}
                  >
                    {capitalizeWords(setInfo.name)}
                  </Typography>
                  <Chip
                    label={getRarityLabel(setInfo.rarity)}
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      color: theme.palette.raritiesColors[setInfo.rarity],
                      border: `1px solid ${alpha(theme.palette.raritiesColors[setInfo.rarity], 0.5)}`
                    }}
                  />
                  </Stack>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2" color={alpha('#fff', 0.7)}>
                        Set Completo:
                      </Typography>
                      <Tooltip
                        title={
                          stats.completeChars.length > 0
                            ? `Personagens com set completo:\n${stats.completeChars.join('\n')}`
                            : 'Nenhum personagem com set completo'
                        }
                        placement="top"
                      >
                        <Chip
                          label={`${stats.complete}/${userChars.length}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(green[500], 0.2),
                            color: green[300],
                            border: `1px solid ${alpha(green[500], 0.3)}`,
                            cursor: 'help'
                          }}
                        />
                      </Tooltip>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2" color={alpha('#fff', 0.7)}>
                        Set Parcial:
                      </Typography>
                      <Tooltip
                        title={
                          stats.partialChars.length > 0
                            ? `\n${stats.partialChars.join('\n')}`
                            : 'Nenhum personagem com set parcial'
                        }
                        placement="top"
                      >
                        <Chip
                          label={`${stats.partial}/${userChars.length}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(blue[500], 0.2),
                            color: blue[300],
                            border: `1px solid ${alpha(blue[500], 0.3)}`,
                            cursor: 'help'
                          }}
                        />
                      </Tooltip>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderBerkasFarmingCalculator = () => {
    const farmingDays = calculateFarmingDays(selectedFarmingChars, selectedPieces);

    return (
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h5"
          color="white"
          gutterBottom
          fontFamily="faktos"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          Calculadora de Farming Berkas
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                bgcolor: alpha(blue[900], 0.9),
                borderRadius: '12px',
                border: `1px solid ${alpha(purple[400], 0.3)}`
              }}
            >
              <Typography variant="h6" color="white" gutterBottom>
                Configuração
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Número de Peças para Farmar</InputLabel>
                  <Select
                    value={selectedPieces}
                    onChange={e => setSelectedPieces(Number(e.target.value))}
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(purple[400], 0.5)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: purple[400]
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: purple[400]
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300 // Limita a altura da lista suspensa
                        }
                      }
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                      <MenuItem key={num} value={num}>
                        {num} {num === 1 ? 'Peça' : 'Peças'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Número de Personagens Farmando</InputLabel>
                  <Select
                    value={selectedFarmingChars}
                    onChange={e => setSelectedFarmingChars(Number(e.target.value))}
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(purple[400], 0.5)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: purple[400]
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: purple[400]
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 400 // Limita a altura da lista suspensa
                        }
                      }
                    }}
                  >
                    {[...Array(23)].map((_, index) => {
                      const num = index + 1;
                      return (
                        <MenuItem key={num} value={num}>
                          {num} {num === 1 ? 'Personagem' : 'Personagens'}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" color={alpha('#fff', 0.9)} gutterBottom>
                  Total de materiais necessários para {selectedPieces}{' '}
                  {selectedPieces === 1 ? 'peça' : 'peças'}:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color={alpha('#fff', 0.7)}>
                    • {farmingDays.totalMaterials.vulcanos} Núcleos Demoníacos do Vulcanos
                  </Typography>
                  <Typography variant="body2" color={alpha('#fff', 0.7)}>
                    • {farmingDays.totalMaterials.nemophilla} Núcleos Demoníacos da Nemophilla
                  </Typography>
                  <Typography variant="body2" color={alpha('#fff', 0.7)}>
                    • {farmingDays.totalMaterials.grandiel} Núcleos Demoníacos do Grandiel
                  </Typography>
                  <Typography variant="body2" color={alpha('#fff', 0.7)}>
                    • {farmingDays.totalMaterials.epicCoins} Moedas Épicas
                  </Typography>
                  <Typography variant="body2" color={alpha('#fff', 0.7)}>
                    • {formatNumberWithThousands(farmingDays.totalMaterials.gp)} GP
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                bgcolor: alpha(blue[900], 0.9),
                borderRadius: '12px',
                border: `1px solid ${alpha(purple[400], 0.3)}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" color="white" gutterBottom>
                Tempo de Farming
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" color={purple[300]} sx={{ mb: 2 }}>
                  Tempo total necessário: {farmingDays.maxDays} dias
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color={alpha('#fff', 0.9)} gutterBottom>
                      Vulcanos ({farmingDays.totalMaterials.vulcanos} núcleos):
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          flex: 1,
                          height: '8px',
                          bgcolor: alpha(red[400], 0.2),
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(farmingDays.vulcanosDays / farmingDays.maxDays) * 100}%`,
                            height: '100%',
                            bgcolor: red[400],
                            transition: 'width 0.3s ease-in-out'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color={red[400]}>
                        {farmingDays.vulcanosDays} dias
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color={alpha('#fff', 0.9)} gutterBottom>
                      Nemophilla ({farmingDays.totalMaterials.nemophilla} núcleos):
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          flex: 1,
                          height: '8px',
                          bgcolor: alpha(purple[400], 0.2),
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(farmingDays.nemophillaDays / farmingDays.maxDays) * 100}%`,
                            height: '100%',
                            bgcolor: purple[400],
                            transition: 'width 0.3s ease-in-out'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color={purple[400]}>
                        {farmingDays.nemophillaDays} dias
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color={alpha('#fff', 0.9)} gutterBottom>
                      Grandiel ({farmingDays.totalMaterials.grandiel} núcleos):
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          flex: 1,
                          height: '8px',
                          bgcolor: alpha(blue[400], 0.2),
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(farmingDays.grandielDays / farmingDays.maxDays) * 100}%`,
                            height: '100%',
                            bgcolor: blue[400],
                            transition: 'width 0.3s ease-in-out'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color={blue[400]}>
                        {farmingDays.grandielDays} dias
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Typography variant="body2" color={alpha('#fff', 0.7)} sx={{ mt: 3 }}>
                  * Cálculo baseado em:
                  <br />• {DAILY_MATERIALS.vulcanos} núcleos do Vulcanos por dia/char
                  <br />• {DAILY_MATERIALS.nemophilla} núcleos da Nemophilla por dia/char
                  <br />• {DAILY_MATERIALS.grandiel} núcleos do Grandiel por dia/char
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderCharactersSkeleton = () => (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
        gap: 1
      }}
    >
      {[...Array(12)].map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          width="100%"
          height={70}
          sx={{ borderRadius: '8px' }}
        />
      ))}
    </Box>
  );

  const renderEquipmentGridSkeleton = () => (
    <Grid container spacing={1}>
      {[...Array(14)].map((_, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(blue[800], 0.3),
              borderRadius: 1,
              border: `1px solid ${alpha(blue[400], 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              minHeight: '75px'
            }}
          >
            <Skeleton variant="text" width={150} height={30} animation="wave" />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  const renderGlobalSetSummarySkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h5"
        color="white"
        gutterBottom
        fontFamily="faktos"
        textAlign="center"
        sx={{ mb: 3 }}
      >
        Sets em Uso
      </Typography>
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                p: 2,
                bgcolor: alpha(blue[900], 0.9),
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                </Box>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Skeleton variant="text" width={80} />
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  if (!isLoading && (!userChars || userChars.length === 0)) {
    return (
      <Box sx={{ p: 2, width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        <Fade in timeout={1000}>
          <Card
            sx={{
              p: 3,
              bgcolor: alpha(blue[900], 0.9),
              borderRadius: '20px',
              boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha(blue[400], 0.1)}`,
              mb: 3
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={selectedTab} onChange={handleTabChange} centered>
                <Tab label="Resumo por Personagem" />
                <Tab label="Resumo Global de Sets" />
                <Tab label="Calculadora Berkas" />
              </Tabs>
            </Box>
            {selectedTab === 2 ? (
              renderBerkasFarmingCalculator()
            ) : (
              <EmptyState
                title="Nenhum personagem encontrado"
                description="Para começar a gerenciar seus equipamentos, você precisa primeiro adicionar alguns personagens ao seu perfil."
                actionLabel="Adicionar Personagem"
                actionRoute="/chars/add-user-char"
              />
            )}
          </Card>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <Fade in timeout={1000}>
        <Card
          sx={{
            p: 3,
            bgcolor: alpha(blue[900], 0.9),
            borderRadius: '20px',
            boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(blue[400], 0.1)}`,
            mb: 3
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange} centered>
              <Tab label="Resumo por Personagem" />
              <Tab label="Resumo Global de Sets" />
              <Tab label="Calculadora Berkas" />
            </Tabs>
          </Box>

          {selectedTab === 0 ? (
            <>
              <Typography
                variant="h5"
                color="white"
                gutterBottom
                fontFamily="faktos"
                textAlign="center"
              >
                Resumo de Sets por Personagem
              </Typography>
              <Box
                sx={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(blue[900], 0.3),
                    borderRadius: '10px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(blue[400], 0.5),
                    borderRadius: '10px',
                    '&:hover': {
                      background: alpha(blue[400], 0.7)
                    }
                  }
                }}
              >
                {isLoading ? (
                  <Grid container spacing={2} sx={{ p: 1 }}>
                    {[...Array(6)].map((_, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box
                          sx={{
                            height: '100%',
                            minHeight: '100px',
                            p: 2,
                            bgcolor: alpha(blue[800], 0.3),
                            borderRadius: 2,
                            border: `1px solid ${alpha(blue[400], 0.2)}`
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 2
                            }}
                          >
                            <Skeleton variant="text" width={120} height={30} />
                            <Stack flexDirection="row" gap={1}>
                              <Skeleton
                                variant="rectangular"
                                width={60}
                                height={24}
                                sx={{ borderRadius: 1 }}
                              />
                              <Skeleton
                                variant="rectangular"
                                width={80}
                                height={24}
                                sx={{ borderRadius: 1 }}
                              />
                            </Stack>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {[...Array(3)].map((_, chipIndex) => (
                              <Skeleton
                                key={chipIndex}
                                variant="rectangular"
                                width={80}
                                height={24}
                                sx={{ borderRadius: 1 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Grid container spacing={2} sx={{ p: 1 }}>
                    {allCharsSummary
                      .map(summary => {
                        // Add counts for sorting
                        const voidItems = Array.from(summary.sets.entries()).find(([setId]) => {
                          const setInfo = equipmentSets.find(set => set.id === setId);
                          return setInfo?.name.toLowerCase().includes('void');
                        });
                        const berkasItems = Array.from(summary.sets.entries()).find(([setId]) => {
                          const setInfo = equipmentSets.find(set => set.id === setId);
                          return setInfo?.name.toLowerCase().includes('berkas');
                        });

                        const voidSet = equipmentSets.find(set =>
                          set.name.toLowerCase().includes('void')
                        );
                        const berkasSet = equipmentSets.find(set =>
                          set.name.toLowerCase().includes('berkas')
                        );

                        return {
                          ...summary,
                          voidCount: voidItems ? voidItems[1] : 0,
                          berkasCount: berkasItems ? berkasItems[1] : 0,
                          voidTotal: voidSet?.totalPieces || 0,
                          berkasTotal: berkasSet?.totalPieces || 0
                        };
                      })
                      .sort((a, b) => {
                        // Sort by Void completion percentage first
                        const voidPercentA = a.voidCount / a.voidTotal || 0;
                        const voidPercentB = b.voidCount / b.voidTotal || 0;
                        if (voidPercentB !== voidPercentA) {
                          return voidPercentB - voidPercentA;
                        }

                        // If tied on Void, sort by Berkas completion percentage
                        const berkasPercentA = a.berkasCount / a.berkasTotal || 0;
                        const berkasPercentB = b.berkasCount / b.berkasTotal || 0;
                        return berkasPercentB - berkasPercentA;
                      })
                      .map(summary => (
                        <Grid item xs={12} sm={6} md={4} key={summary.name}>
                          <Box
                            sx={{
                              height: '100%',
                              minHeight: '100px',
                              p: 2,
                              bgcolor: alpha(blue[800], 0.3),
                              borderRadius: 2,
                              border: `1px solid ${alpha(blue[400], 0.2)}`,
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(blue[400], 0.2)}`,
                                borderColor: alpha(blue[400], 0.4)
                              }
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Typography
                                variant="h6"
                                color="white"
                                sx={{ fontSize: '1.1rem', fontWeight: 600 }}
                              >
                                {summary.name}
                              </Typography>
                              <Stack flexDirection="row" gap={1}>
                                <Typography
                                  variant="body2"
                                  color={alpha('#fff', 0.7)}
                                  sx={{
                                    bgcolor: alpha(blue[500], 0.2),
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Lv.{summary.level}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color={alpha('#fff', 0.7)}
                                  sx={{
                                    bgcolor: alpha(blue[500], 0.2),
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  ATK: {formatNumberWithThousands(summary.atkTotal)}
                                </Typography>
                              </Stack>
                            </Box>

                            <Box
                              sx={{
                                mt: '8px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                                maxHeight: '80px',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                  width: '4px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  background: alpha(blue[400], 0.3),
                                  borderRadius: '4px'
                                }
                              }}
                            >
                              {Array.from(summary.sets.entries()).map(([setId, count]) => {
                                const setInfo = equipmentSets.find(set => set.id === setId);
                                if (!setInfo) return null;

                                const color = setInfo.name.toLowerCase().includes('berkas')
                                  ? purple[500]
                                  : setInfo.name.toLowerCase().includes('void')
                                    ? green[500]
                                    : blue[500];

                                return (
                                  <Chip
                                    key={setId}
                                    label={`${capitalizeWords(setInfo.name)}: ${count}/${setInfo.totalPieces}`}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(color, 0.2),
                                      color: 'white',
                                      border: `1px solid ${alpha(color, 0.5)}`,
                                      '& .MuiChip-label': { px: 2 }
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>
            </>
          ) : selectedTab === 1 ? (
            isLoading ? (
              renderGlobalSetSummarySkeleton()
            ) : (
              renderGlobalSetSummary()
            )
          ) : (
            renderBerkasFarmingCalculator()
          )}
        </Card>
      </Fade>

      {/* Lista de personagens */}
      <Fade in timeout={1000}>
        <Card
          sx={{
            p: 1,
            bgcolor: alpha(blue[900], 0.9),
            borderRadius: '20px',
            boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(blue[400], 0.1)}`,
            transition: 'all 0.3s ease-in-out',
            display: selectedTab === 0 ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3
          }}
        >
          {isLoading ? (
            renderCharactersSkeleton()
          ) : (
            <Box
              sx={{
                width: '100%',
                maxWidth: '1200px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                gap: 1
              }}
            >
              {userChars.map(char => (
                <SelectableImage
                  key={char.id}
                  char={char.gameChar}
                  disabled={false}
                  isSelected={selectedChar?.id === char.id}
                  onSelect={() => handleSelectChar(char)}
                />
              ))}
            </Box>
          )}
        </Card>
      </Fade>

      {/* Detalhes do equipamento */}
      {selectedChar && userCharDetails && selectedTab === 0 && (
        <Fade in timeout={300}>
          <Card
            sx={{
              p: 3,
              bgcolor: alpha(blue[900], 0.9),
              borderRadius: '20px',
              boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha(blue[400], 0.1)}`
            }}
          >
            {/* Nome do personagem e status total */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontFamily="faktos" color="white" gutterBottom>
                {selectedChar.gameChar.name} | ATK Total:{' '}
                {formatNumberWithThousands(userCharDetails.results.atkTotal)}
              </Typography>
            </Box>

            {/* Equipment Grid */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(blue[900], 0.2),
                    borderRadius: 2,
                    border: `1px solid ${alpha(blue[500], 0.3)}`
                  }}
                >
                  <Typography variant="subtitle1" color="white" sx={{ mb: 2 }}>
                    Sets Equipados
                  </Typography>
                  <Stack spacing={1}>
                    {Array.from(calculateSetSummary().entries()).map(([setId, count]) => {
                      const setInfo = equipmentSets.find(set => set.id === setId);
                      if (!setInfo) return null;

                      const progress = (count / setInfo.totalPieces) * 100;
                      const color = theme.palette.raritiesColors[setInfo.rarity];

                      return (
                        <Box key={setId}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5
                            }}
                          >
                            <Typography variant="body2" color={color}>
                              {capitalizeWords(setInfo.name)}
                            </Typography>
                            <Typography variant="body2" color={alpha(color, 0.8)}>
                              {count}/{setInfo.totalPieces}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: '100%',
                              height: '4px',
                              bgcolor: alpha(color, 0.1),
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${progress}%`,
                                height: '100%',
                                bgcolor: color,
                                transition: 'width 0.3s ease-in-out'
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                {isLoading || isLoadingDetails
                  ? renderEquipmentGridSkeleton()
                  : renderEquipmentGrid()}
              </Grid>
            </Grid>
          </Card>
        </Fade>
      )}

      {/* Modal para equipar itens */}
      <Dialog
        open={isEquipModalOpen}
        onClose={() => setIsEquipModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: alpha(blue[900], 0.95),
            backdropFilter: 'blur(8px)',
            borderRadius: '20px'
          }
        }}
      >
        <DialogContent>
          {selectedSlot && selectedChar && (
            <Inventory
              fetchType="allItems"
              loading={equipLoading}
              hasMoveItem
              onMoveTitle="Mover e Equipar"
              onMoveItem={handleMoveAndEquipItem}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GearTrackerPage;
