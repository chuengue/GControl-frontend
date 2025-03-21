import { Box, FormControl, MenuItem, Select, Tab, Tabs, TextField } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { accessoriesOptions, armorTypeOptions, categoryOptions, raritiesOptions } from '../../../pages/admin/consts';
import { deleteItem, equipItem, getUserCharItems, unequipItem, updateQuantityItem } from '../../../service/requests/inventory';
import { getItemsFilters } from '../../../service/requests/items';
import { AccessoryType, EquipmentType, ItemCategory, Rarity } from '../../../service/requests/types';
import useCharStore from '../../../stores/charStore';
import { useSnackbarStore } from '../../../stores/snackBarStore';
import { formatItemBoxPropsItem } from '../itemBox/formatItem';
import ItemBox from '../itemBox/itemBox';

// Função de debounce
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const Inventory: React.FC<{
  fetchType?: 'allItems' | 'charItens';
  hasChangeQuantity?: boolean;
  hasMoveItem?: boolean;
  onMoveTitle?: string;
  hasOnEquip?: boolean;
  hasOnUnequip?: boolean;
  onMoveItem?: (item) => void;
}> = ({
  fetchType = 'allItems',
  hasChangeQuantity = false,
  hasMoveItem = false,
  hasOnEquip = false,
  onMoveTitle = '',
  hasOnUnequip = false,
  onMoveItem
}) => {
  const { charId } = useParams<{ charId: string }>();
  const { showSnackbar } = useSnackbarStore();
  const { userItems, setUserItems } = useCharStore();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('');
  const [search, setSearch] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('');
  const [selectedAccessoryType, setSelectedAccessoryType] = useState<AccessoryType>('');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType>('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const { userChars, allChars } = useCharStore();

  // Função debounce para o search
  const debouncedSearch = useCallback(
    debounce(value => {
      setSearch(value);
    }, 500), // Ajuste o delay conforme necessário (500ms neste exemplo)
    []
  );

  const fetchAllItems = async () => {
    try {
      const data = await getItemsFilters({
        category: selectedCategory,
        rarity: selectedRarity,
        search: search,
        accessoryType: selectedAccessoryType,
        equipmentType: selectedEquipmentType,
        page: page
      });
      // Filter items based on usableBy property
      const filteredItems = data.results.filter(item => {
        // Permitir itens sem restrição de uso
        if (!item.usableBy) return true;
      
        // Encontrar o personagem atual
        const userChar = userChars.find(
          char => char.id === charId || char.gameChar?.id === charId
        );
        console.log(charId)
      
        // Se o personagem não for encontrado, não filtrar o item
        if (!userChar) return false;
      
        // Se usableBy for uma string, comparar diretamente
        if (typeof item.usableBy === "string") {
          return item.usableBy === userChar.gameChar.name;
        }
      
        // Se usableBy for uma lista, verificar se inclui o nome do personagem
        if (Array.isArray(item.usableBy)) {
          return item.usableBy.includes(userChar.gameChar.name);
        }
      
        return false;
      });
      
      setItems(filteredItems);
    } catch (error) {
      showSnackbar(error.message, 'error', error.stack);
    }
  };

  const fetchUserItems = async () => {
    try {
      const data = await getUserCharItems(charId, {
        category: selectedCategory,
        rarity: selectedRarity,
        search: search,
        accessoryType: selectedAccessoryType,
        equipmentType: selectedEquipmentType
      });
      const itemOnly = data.results.map(item => formatItemBoxPropsItem(item));
      // Filter items based on usableBy property
      const filteredItems = data.results.filter(item => {
        // Permitir itens sem restrição de uso
        if (!item.usableBy) return true;
      
        // Encontrar o personagem atual
        const userChar = userChars.find(
          char => char.id === charId || char.gameChar?.id === charId
        );
      
        // Se o personagem não for encontrado, não filtrar o item
        if (!userChar) return false;
      
        // Se usableBy for uma string, comparar diretamente
        if (typeof item.usableBy === "string") {
          return item.usableBy === userChar.gameChar.name;
        }
      
        // Se usableBy for uma lista, verificar se inclui o nome do personagem
        if (Array.isArray(item.usableBy)) {
          return item.usableBy.includes(userChar.gameChar.name);
        }
      
        return false;
      });
      
      setItems(filteredItems);
    } catch (error) {
      setUserItems([]);
      showSnackbar(error.message, 'error', error.stack);
    }
  };

  useEffect(() => {
    if (fetchType === 'allItems') {
      fetchAllItems();
    } else if (fetchType === 'charItens') {
      fetchUserItems();
    }
  }, [
    selectedCategory,
    selectedRarity,
    selectedAccessoryType,
    selectedEquipmentType,
    search,
    page
  ]);

  const handleChangeTab = (newValue: ItemCategory) => {
    setPage(1);
    setSelectedAccessoryType('');
    setSelectedEquipmentType('');
    setSearch('');
    setSelectedCategory(newValue);
  };

  const onEquipItem = async (itemId: string) => {
    try {
      await equipItem(charId, itemId);
      fetchUserItems();
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

  const onUnequipItem = async (itemId: string) => {
    try {
      await unequipItem(charId, itemId);
      fetchUserItems();
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

  const onChangeQuantity = async (item, value) => {
    const newValue = item.quantity + value;
    const userItemId = item.userInventoryItemId;
    if (newValue === 0) {
      await deleteItem(charId, userItemId);
      fetchUserItems();
      return;
    }
    const data = {
      quantity: newValue
    };
    try {
      await updateQuantityItem(charId, userItemId, data);
      fetchUserItems();
    } catch (error) {
      showSnackbar(error.message, 'error', error.stack);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 2,
        bgcolor: blue[800],
        borderRadius: '12px'
      }}
    >
      <Tabs
        value={selectedCategory}
        onChange={(_, newValue) => handleChangeTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          bgcolor: blue[600],
          borderRadius: '12px 12px 0px 0px'
        }}
      >
        {categoryOptions.map(category => (
          <Tab key={category.value} label={category.label} value={category.value} />
        ))}
      </Tabs>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mt: 1,
          bgcolor: blue[600],
          borderRadius: '12px',
          p: 1
        }}
      >
        <TextField
          label="Buscar Item"
          variant="outlined"
          size="small"
          fullWidth
          defaultValue={search}
          onChange={e => debouncedSearch(e.target.value)} // Aplica o debounce aqui
          sx={{
            width: '50%'
          }}
        />
        {selectedCategory === 'equipment' && (
          <FormControl size="small" sx={{ width: 200 }}>
            <Select
              value={selectedEquipmentType}
              onChange={e => setSelectedEquipmentType(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Tipo</MenuItem>
              {armorTypeOptions.map(armorType => (
                <MenuItem key={armorType.label} value={armorType.value}>
                  {armorType.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {selectedCategory === 'accessory' && (
          <FormControl size="small" sx={{ width: 200 }}>
            <Select
              value={selectedAccessoryType}
              onChange={e => setSelectedAccessoryType(e.target.value)}
              displayEmpty
              sx={{ width: 200 }}
            >
              <MenuItem value="">Tipo</MenuItem>
              {accessoriesOptions.map(accessory => (
                <MenuItem key={accessory.label} value={accessory.value}>
                  {accessory.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl size="small" sx={{ width: 200 }}>
          <Select
            value={selectedRarity}
            onChange={e => setSelectedRarity(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Todas Raridades</MenuItem>
            {raritiesOptions.map(rarity => (
              <MenuItem key={rarity.label} value={rarity.value}>
                {rarity.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Inventário com Scroll e Grid */}
      <Box
        sx={{
          bgcolor: blue[600],
          borderRadius: '12px',
          height: 'auto'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 1,
            mt: 1,
            overflowY: 'auto',
            p: 2
          }}
        >
          {(fetchType === 'charItens' ? userItems : items).length > 0 ? (
            (fetchType === 'charItens' ? userItems : items).map(item => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <ItemBox
                  item={item}
                  hasChangeQuantity={hasChangeQuantity}
                  hasMoveItem={hasMoveItem}
                  onMoveTitle={onMoveTitle}
                  hasOnEquip={hasOnEquip}
                  hasOnUnequip={hasOnUnequip}
                  onMoveItem={onMoveItem}
                  onChangeQuantity={(item, value) => onChangeQuantity(item, value)}
                  onUnequip={item => onUnequipItem(item.userInventoryItemId)}
                  onEquip={item => onEquipItem(item.userInventoryItemId)}
                />
              </Box>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>Nenhum item encontrado</Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Inventory;
