import { Cancel, Check, Edit, ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, IconButton, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { accessoriesOptions, armorTypeOptions } from '../../../pages/admin/consts';
import { EquipmentType, GrandChaseItem } from '../../../pages/admin/types';
import { getUserCharAtkHistoric, getUserCharDetails, updateUserGameChar } from '../../../service/requests/gameChar';
import { unequipItem } from '../../../service/requests/inventory.ts';
import { AtkTotalLog } from '../../../service/requests/types';
import useCharStore from '../../../stores/charStore';
import { useSnackbarStore } from '../../../stores/snackBarStore';
import { formatNumberWithThousands } from '../../../utils/utils.ts';
import ItemBox from '../itemBox/itemBox';

const UserCharDetailsView = () => {
  const { charId, userId } = useParams();
  const [userChar, setUserChar] = useState<any>(null);
  const { userItems, setUserItems } = useCharStore();
  const [atkHistory, setAtkHistory] = useState<AtkTotalLog[]>([]);
  const { fetchUserItems } = useCharStore();
  const { showSnackbar } = useSnackbarStore();
  const [atkTotal, setAtkTotal] = useState<number>(0); // Variável para armazenar o atkTotal editado
  const [isEditing, setIsEditing] = useState(false);
  const [atkTotalEdit, setAtkTotalEdit] = useState<number | null>(null);

  const fetchUserCharHistory = async (userCharId: string) => {
    try {
      const results = await getUserCharAtkHistoric(userCharId);
      setAtkHistory(results.results);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const UpdateAtkTotal = async (userCharId: string, atkTotal: number, level: number) => {
    if (charId)
      try {
        await updateUserGameChar(userCharId, userId, {
          atkTotal,
          level
        });
        showSnackbar('Atualizado com sucesso', 'success');
        fetchUserCharHistory(charId);
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
  };
  useEffect(() => {
    if (!charId) return;
    fetchUserCharHistory(charId);
  }, [charId]);

  useEffect(() => {
    const fetchUserCharDetails = async () => {
      if (!userId || !charId) return;
      try {
        const userCharDetails = await getUserCharDetails(userId, charId);
        setUserChar(userCharDetails);
        setAtkTotal(userCharDetails.results.atkTotal); // Definir o atkTotal atual
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    };

    fetchUserCharDetails();
  }, [userId, charId, userItems]);

  const handleEditAtkTotal = event => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = event => {
    event.stopPropagation();
    setAtkTotalEdit(userChar?.results.atkTotal);
    setIsEditing(false);
  };

  const handleSaveEdit = event => {
    event.stopPropagation();
    if (!charId) return;
    if (atkTotalEdit === null) return;

    UpdateAtkTotal(charId, atkTotalEdit, userChar?.results.level);
    setAtkTotal(atkTotalEdit);
    setIsEditing(false);
  };

  const onUnequipItem = async (itemId: string) => {
    const userInventoryItem = userItems.find(item => item.id === itemId);
    try {
      await unequipItem(charId, userInventoryItem.userInventoryItemId);
      fetchUserItems(charId);
      showSnackbar('Item equipado', 'success', {
        vertical: 'top',
        horizontal: 'center'
      });
    } catch (error) {
      showSnackbar(`Erro ao equipar item:', ${error}`, 'error', {
        vertical: 'top',
        horizontal: 'center'
      });
    }
  };

  const parseItem = (item: any): GrandChaseItem | null => {
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      iconUrl: item.iconUrl,
      rarity: item.rarity,
      stats: {
        attack: item.attack || 0,
        defense: item.defense || 0,
        hp: item.hp || 0
      },
      equipped: true,
      armorType: item.armorType,
      setName: item.setName,
      usableBy: item.usableBy,
      accessoryType: item.accessoryType
    };
  };

  if (!userChar) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 3,
          color: '#fff',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <Skeleton
          width="650px"
          height="100%"
          animation="wave"
          variant="rectangular"
          sx={{ borderRadius: '12px' }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 3,
        background: blue[800],
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        color: '#fff',
        width: '100%',
        margin: '0 auto'
      }}
    >
      {/* Nome do personagem centralizado */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card
          elevation={3}
          sx={{
            p: 1,
            borderRadius: 4,
            bgcolor: blue[700],
            opacity: 0.9,
            textAlign: 'center',
            width: '50%'
          }}
        >
          <Typography fontFamily="faktos" variant="h5">
            {userChar.results.gameChar.name}
          </Typography>
        </Card>
      </Box>

      {/* Container principal com equipamentos, personagem e acessórios */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Equipamentos à esquerda */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: 1,
            width: 'fit-content',
            transform: 'scale(0.8)'
          }}
        >
          {armorTypeOptions.map(slot => {
            const equippedItem = userChar?.results.gameChar.equippedItems.find(
              item => item.armorType === slot.value
            );

            const parsedItem = parseItem(equippedItem);

            return (
              <ItemBox
                key={slot.value}
                IsDefault={!parsedItem}
                defaultType={slot.label as EquipmentType}
                hasOnUnequip={!!parsedItem}
                onUnequip={() => onUnequipItem(parsedItem?.id)}
                item={parsedItem || {}}
              />
            );
          })}
        </Box>

        {/* Imagem do personagem */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40%'
          }}
        >
          <img
            height="300px"
            src={userChar.results.gameChar.classes[0].img}
            alt="Personagem"
            style={{
              borderRadius: '8px'
            }}
          />
        </Box>

        {/* Acessórios à direita */}
        <Box
          sx={{
            display: 'flex',
            width: 'fit-content',
            height: 'fit-content'
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              transform: 'scale(0.8)'
            }}
          >
            {accessoriesOptions.map(slot => {
              const equippedItem = userChar?.results.gameChar.equippedItems.find(
                item => item.accessoryType === slot.value
              );

              const parsedItem = parseItem(equippedItem);

              return (
                <ItemBox
                  key={slot.value}
                  IsDefault={!parsedItem}
                  defaultType={slot.label as EquipmentType}
                  hasOnUnequip={!!parsedItem}
                  onUnequip={() => onUnequipItem(parsedItem?.id)}
                  item={parsedItem || {}}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Ataque Total e Histórico */}
      <Card
        elevation={3}
        sx={{
          background: blue[700],
          borderRadius: '8px',
          color: '#fff',
          width: '100%',
          mt: '-34px'
        }}
      >
        <Accordion
          sx={{
            bgcolor: blue[700]
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              {isEditing ? (
                <Box display="flex" alignItems="center">
                  <TextField
                    value={atkTotalEdit || ''}
                    onChange={e => setAtkTotalEdit(Number(e.target.value))}
                    onClick={e => e.stopPropagation()}
                    variant="standard"
                    color="secondary"
                    size="small"
                    sx={{ input: { color: '#fff' } }}
                    autoFocus
                  />
                  <IconButton onClick={event => handleSaveEdit(event)} color="primary">
                    <Check />
                  </IconButton>
                  <IconButton onClick={event => handleCancelEdit(event)} color="error">
                    <Cancel />
                  </IconButton>
                </Box>
              ) : (
                <Box display="flex" alignItems="center">
                  <Typography variant="h6">
                    Ataque Total: {formatNumberWithThousands(atkTotal)}
                  </Typography>
                  <IconButton onClick={event => handleEditAtkTotal(event)} color="primary">
                    <Edit />
                  </IconButton>
                </Box>
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              height: '160px',
              overflowY: 'auto'
            }}
          >
            {atkHistory.length > 0 ? (
              <TableContainer>
                <Table aria-label="historico de ataques">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Ataque</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Data</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {atkHistory.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{formatNumberWithThousands(log.atkTotal)}</TableCell>
                        <TableCell align="right">
                          {new Date(log.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2">Nenhum histórico encontrado.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Card>
    </Box>
  );
};

export default UserCharDetailsView;
