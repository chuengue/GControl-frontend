import { Add, DeleteForever, Remove } from '@mui/icons-material';
// Importando ícones
import { Box, Button, Card, Divider, IconButton, List, ListItem, Modal, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getItemsFilters } from '../../../../service/requests/items';
import ItemBox from '../../../../shared/components/itemBox/itemBox';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '100%', md: '800px' },
  bgcolor: blue[700],
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const listContainerStyle = {
  borderRadius: 2,
  p: 2,
  backgroundColor: blue[600]
};

const DropItemsModal = ({ open, onClose, onSave, isLoading }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const listRef = useRef(null);

  // Fetch Items da API
  const fetchItems = async (reset = false) => {
    try {
      const response = await getItemsFilters({ search: searchTerm, page });
      setItems(prev => (reset ? response.results : [...prev, ...response.results]));
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  };

  // Carrega os itens na abertura e quando o searchTerm muda
  useEffect(() => {
    setPage(1);
    fetchItems(true);
  }, [searchTerm]);

  // Observador para detectar quando a lista chega ao final
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 10 && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  // Efeito para carregar mais itens conforme a página muda
  useEffect(() => {
    if (page > 1) {
      fetchItems();
    }
  }, [page]);

  // Seleciona/Deseleciona um item
  const handleSelectItem = item => {
    console.log(selectedItems)
    const isSelected = selectedItems.some(selected => selected.itemId === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.itemId !== item.id));
    } else {
      setSelectedItems([...selectedItems, { itemId: item.id, quantity: 1, rarity:item.rarity, iconUrl:item.iconUrl, name: item.name, category: item.category}]);
    }
  };

  // Atualiza a quantidade dos itens selecionados
  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(
      selectedItems.map(item =>
        item.itemId === itemId ? { ...item, quantity: parseInt(quantity, 10) } : item
      )
    );
  };

  // Incrementa a quantidade
  const handleIncrement = itemId => {
    setSelectedItems(
      selectedItems.map(item =>
        item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrementa a quantidade
  const handleDecrement = itemId => {
    setSelectedItems(
      selectedItems.map(item =>
        item.itemId === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Remove o item da lista de selecionados
  const handleRemoveItem = itemId => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };
  const handleOnClose = () => {
    onClose();
    setSelectedItems([]);
  };
  const handleSave = () => {
    onSave(selectedItems);
    setSelectedItems([]);
  };
  useEffect(() => {
    if (isLoading) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
      onClose();
    }
  }, [isLoading]);
  return (
    <Modal open={open} onClose={handleOnClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Cadastrar Itens Dropados
        </Typography>

        {/* Campo de Pesquisa */}
        <TextField
          fullWidth
          label="Pesquisar Item"
          variant="outlined"
          sx={{ mb: 2, maxWidth: 350 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Lista de Itens Disponíveis com Scroll Infinito */}
          <Card
            elevation={3}
            sx={{
              ...listContainerStyle,
              flex: 1,
              maxHeight: { xs: '200px', md: '400px' },
              overflowY: 'auto'
            }}
            ref={listRef}
            onScroll={handleScroll}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
              Itens Disponíveis
            </Typography>
            <Divider orientation="horizontal" />

            <List>
              {items.map((item,index) => (
                <ListItem
                  button
                  key={`${item.id}-${index}`}
                  
                  onClick={() => handleSelectItem(item)}
                  selected={selectedItems.some(selected => selected.itemId === item.id)}
                  component="div"
                  sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px'
                  }}
                >
                  <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%' }}>
                    {item ? (
                      <Box sx={{ width: 60, flexShrink: 0 }}>
                        <ItemBox item={item} hasDetails={false} />
                      </Box>
                    ) : (
                      <Box sx={{ width: 60, flexShrink: 0 }}>
                        <Skeleton />
                      </Box>
                    )}

                    {/* Nome do item */}
                    <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-word' }}>
                      {item.name}
                    </Typography>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Lista de Itens Selecionados com Scroll Normal */}
          <Card
            elevation={3}
            sx={{
              ...listContainerStyle,
              flex: 1,
              maxHeight: { xs: '200px', md: '400px' },
              overflowY: 'auto'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
              Itens Selecionados
            </Typography>
            <Divider orientation="horizontal" />

            <List>
              {selectedItems.map((selected, index) => {
                return (
                  <ListItem
                    key={`${selected.itemId}-${index}`}
                    sx={{
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      justifyContent="space-around"
                      sx={{ width: '100%' }}
                    >
                      {selected ? (
                      <Box sx={{ width: 60, flexShrink: 0 }}>
                        <ItemBox item={selected} hasDetails={false} />
                      </Box>
                    ) : (
                      <Box sx={{ width: 60, flexShrink: 0 }}>
                        <Skeleton  />
                      </Box>
                    )}
                      {/* Botão de decremento */}
                      <IconButton
                        onClick={() => handleDecrement(selected.itemId)}
                        sx={{ color: 'white' }}
                      >
                        <Remove />
                      </IconButton>
                      {/* Campo de quantidade */}
                      <TextField
                        type="number"
                        value={selected.quantity}
                        onChange={e => handleQuantityChange(selected.itemId, e.target.value)}
                        inputProps={{ min: 1 }}
                        sx={{ width: '80px', flexShrink: 0 }}
                      />
                      {/* Botão de incremento */}
                      <IconButton
                        onClick={() => handleIncrement(selected.itemId)}
                        sx={{ color: 'white' }}
                      >
                        <Add />
                      </IconButton>
                      {/* Botão de exclusão */}
                      <IconButton
                        onClick={() => handleRemoveItem(selected.itemId)}
                        sx={{ color: 'white' }}
                      >
                        <DeleteForever />
                      </IconButton>
                    </Stack>
                  </ListItem>
                );
              })}
            </List>
          </Card>
        </Box>

        {/* Botões de Ação */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={handleOnClose} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            loading={isLoading}
            sx={{
              color: 'white',
              minWidth: 120,
              borderRadius: 8,
              backgroundColor: blue[600],
              '&:hover': { backgroundColor: blue[900] }
            }}
          >
            Salvar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DropItemsModal;
