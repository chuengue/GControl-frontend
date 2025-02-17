import { Add, DeleteForever, Remove } from '@mui/icons-material';
// Importando ícones
import { Box, Button, Card, Divider, IconButton, List, ListItem, Modal, Stack, TextField, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getItemsFilters } from '../../../../service/requests/items';
import ItemBox from '../../../../shared/components/itemBox/itemBox';

const modalStyle = {
   position: 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   width: 800,
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

const DropItemsModal = ({ open, onClose, onSave }) => {
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
         setItems(prev =>
            reset ? response.results : [...prev, ...response.results]
         );
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
      const isSelected = selectedItems.some(
         selected => selected.itemId === item.id
      );
      if (isSelected) {
         setSelectedItems(
            selectedItems.filter(selected => selected.itemId !== item.id)
         );
      } else {
         setSelectedItems([...selectedItems, { itemId: item.id, quantity: 1 }]);
      }
   };

   // Atualiza a quantidade dos itens selecionados
   const handleQuantityChange = (itemId, quantity) => {
      setSelectedItems(
         selectedItems.map(item =>
            item.itemId === itemId
               ? { ...item, quantity: parseInt(quantity, 10) }
               : item
         )
      );
   };

   // Incrementa a quantidade
   const handleIncrement = itemId => {
      setSelectedItems(
         selectedItems.map(item =>
            item.itemId === itemId
               ? { ...item, quantity: item.quantity + 1 }
               : item
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
      setSelectedItems(
         selectedItems.filter(item => item.itemId !== itemId)
      );
   };
   const handleOnClose =()=>{
      onClose();
      setSelectedItems([]);
   }
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

            <Box sx={{ display: 'flex', gap: 3 }}>
               {/* Lista de Itens Disponíveis com Scroll Infinito */}
               <Card
                  elevation={3}
                  sx={{
                     ...listContainerStyle,
                     flex: 1,
                     maxHeight: 400,
                     overflowY: 'auto'
                  }}
                  ref={listRef}
                  onScroll={handleScroll}
               >
                  <Typography
                     variant="subtitle1"
                     sx={{ mb: 1, color: 'white' }}
                  >
                     Itens Disponíveis
                  </Typography>
                  <Divider orientation="horizontal" />

                  <List>
                     {items.map(item => (
                        <ListItem
                           button
                           key={item.id}
                           onClick={() => handleSelectItem(item)}
                           selected={selectedItems.some(
                              selected => selected.itemId === item.id
                           )}
                           component="div"
                           sx={{ mb: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius:"12px"}}
                        >
                           <Stack
                              direction="row"
                              spacing={3}
                              alignItems="center"
                              sx={{ width: '100%' }}
                           >
                              {/* ItemBox com largura fixa */}
                              <Box sx={{ width: 60, flexShrink: 0 }}>
                                 <ItemBox item={item} hasDetails={false} />
                              </Box>
                              {/* Nome do item */}
                              <Typography
                                 variant="body2"
                                 sx={{ flexGrow: 1, wordBreak: 'break-word' }}
                              >
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
                     maxHeight: 400,
                     overflowY: 'auto'
                  }}
               >
                  <Typography
                     variant="subtitle1"
                     sx={{ mb: 1, color: 'white' }}
                  >
                     Itens Selecionados
                  </Typography>
                  <Divider orientation="horizontal" />
                  
                  <List>
                     {selectedItems.map(selected => {
                        const item = items.find(i => i.id === selected.itemId);
                        return (
                           <ListItem
                              key={selected.itemId}
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
                                 {/* ItemBox com largura fixa */}
                                 <Box sx={{ width: 60, flexShrink: 0 }}>
                                    <ItemBox item={item} hasDetails={false} />
                                 </Box>
                                 {/* Botão de decremento */}
                                 <IconButton
                                    onClick={() =>
                                       handleDecrement(selected.itemId)
                                    }
                                    sx={{ color: 'white' }}
                                 >
                                    <Remove />
                                 </IconButton>
                                 {/* Campo de quantidade */}
                                 <TextField
                                    type="number"
                                    value={selected.quantity}
                                    onChange={e =>
                                       handleQuantityChange(
                                          selected.itemId,
                                          e.target.value
                                       )
                                    }
                                    inputProps={{ min: 1 }}
                                    sx={{ width: '80px', flexShrink: 0 }}
                                 />
                                 {/* Botão de incremento */}
                                 <IconButton
                                    onClick={() =>
                                       handleIncrement(selected.itemId)
                                    }
                                    sx={{ color: 'white' }}
                                 >
                                    <Add />
                                 </IconButton>
                                 {/* Botão de exclusão */}
                                 <IconButton
                                    onClick={() =>
                                       handleRemoveItem(selected.itemId)
                                    }
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
                  onClick={() => onSave(selectedItems)}
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