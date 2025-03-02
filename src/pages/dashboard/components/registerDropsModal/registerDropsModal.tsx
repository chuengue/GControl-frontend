import { Add, DeleteForever, Remove } from '@mui/icons-material';
// Importando ícones
import { Box, Button, Card, Divider, IconButton, List, ListItem, Modal, Skeleton, Stack, TextField, Typography, useTheme, alpha } from '@mui/material';
import { blue, grey, green } from '@mui/material/colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getItemsFilters } from '../../../../service/requests/items';
import ItemBox from '../../../../shared/components/itemBox/itemBox';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '100%', md: '800px' },
  background: `linear-gradient(135deg, ${alpha(blue[800], 0.7)} 0%, ${alpha(blue[900], 0.6)} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 20px ${alpha('#000', 0.3)}`,
  p: 4,
  borderRadius: '16px',
  border: `1px solid ${alpha(blue[400], 0.1)}`
};

const listContainerStyle = {
  borderRadius: '16px',
  p: 2,
  background: `linear-gradient(145deg, ${alpha(blue[700], 0.4)}, ${alpha(blue[800], 0.3)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(blue[400], 0.1)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 20px ${alpha('#000', 0.2)}`
  },
  minWidth: '50%',
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
        <Typography variant="h6" gutterBottom sx={{ color: grey[100], mb: 3 }}>
          Cadastrar Itens Dropados
        </Typography>

        {/* Campo de Pesquisa */}
        <TextField
          fullWidth
          label="Pesquisar Item"
          variant="outlined"
          sx={{
            mb: 3,
            maxWidth: 350,
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha(blue[900], 0.5),
              '&:hover': {
                backgroundColor: alpha(blue[900], 0.7)
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(blue[400], 0.2)
            },
            '& .MuiInputLabel-root': {
              color: grey[300]
            },
            '& input': {
              color: grey[100]
            }
          }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Lista de Itens Disponíveis com Scroll Infinito */}
          <Card
            elevation={3}
            sx={listContainerStyle}
            ref={listRef}
            onScroll={handleScroll}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, color: grey[100], fontWeight: 500 }}>
              Itens Disponíveis
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: alpha(grey[400], 0.1) }} />

            <List sx={{ maxHeight: { xs: '200px', md: '400px' }, overflowY: 'auto' }}>
              {items.map((item,index) => (
                <ListItem
                  key={`${item.id}-${index}`}
                  onClick={() => handleSelectItem(item)}
                  selected={selectedItems.some(selected => selected.itemId === item.id)}
                  sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: selectedItems.some(selected => selected.itemId === item.id)
                      ? alpha(blue[600], 0.3)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(blue[600], 0.2),
                      transform: 'translateX(4px)'
                    }
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

                    <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-word', color: grey[100] }}>
                      {item.name}
                    </Typography>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Lista de Itens Selecionados */}
          <Card
            elevation={3}
            sx={listContainerStyle}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, color: grey[100], fontWeight: 500 }}>
              Itens Selecionados
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: alpha(grey[400], 0.1) }} />

            <List sx={{ maxHeight: { xs: '200px', md: '400px' }, overflowY: 'auto' }}>
              {selectedItems.map((selected, index) => (
                <ListItem
                  key={`${selected.itemId}-${index}`}
                  sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '12px',
                    backgroundColor: alpha(blue[600], 0.1),
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(blue[600], 0.2)
                    }
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
                        <Skeleton />
                      </Box>
                    )}

                    <IconButton
                      onClick={() => handleDecrement(selected.itemId)}
                      sx={{
                        color: grey[300],
                        '&:hover': { color: grey[100], backgroundColor: alpha(blue[400], 0.1) }
                      }}
                    >
                      <Remove />
                    </IconButton>

                    <TextField
                      type="number"
                      value={selected.quantity}
                      onChange={e => handleQuantityChange(selected.itemId, e.target.value)}
                      inputProps={{ min: 1 }}
                      sx={{
                        width: '80px',
                        flexShrink: 0,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: alpha(blue[900], 0.5),
                          color: grey[100]
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(blue[400], 0.2)
                        }
                      }}
                    />

                    <IconButton
                      onClick={() => handleIncrement(selected.itemId)}
                      sx={{
                        color: grey[300],
                        '&:hover': { color: grey[100], backgroundColor: alpha(blue[400], 0.1) }
                      }}
                    >
                      <Add />
                    </IconButton>

                    <IconButton
                      onClick={() => handleRemoveItem(selected.itemId)}
                      sx={{
                        color: grey[300],
                        '&:hover': { color: grey[100], backgroundColor: alpha(blue[400], 0.1) }
                      }}
                    >
                      <DeleteForever />
                    </IconButton>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Card>
        </Box>

        {/* Botões de Ação */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button
            onClick={handleOnClose}
            sx={{
              color: grey[300],
              borderColor: alpha(grey[400], 0.2),
              '&:hover': {
                borderColor: grey[400],
                backgroundColor: alpha(grey[700], 0.2)
              }
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              minWidth: 120,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${blue[600]} 0%, ${blue[800]} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${blue[500]} 0%, ${blue[700]} 100%)`
              }
            }}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DropItemsModal;
