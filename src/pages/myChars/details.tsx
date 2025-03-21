import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { getUserCharDetails } from '../../service/requests/gameChar';
import { addItemToInventory } from '../../service/requests/inventory';
import Inventory from '../../shared/components/inventory/inventory';
import UserCharDetailsView from '../../shared/components/userCharDetailsView/userCharDetailsView';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';

const equipmentSlots = ['Elmo', 'Luvas', 'Cota', 'Calça', 'Sapato'];
const accessorySlots = [
    'Anel',
    'Brincos',
    'Piercing',
    'Colar',
    'Tornozeleira',
    'Diadema',
    'Facas',
    'Asas',
    'Máscara',
    'Escudo'
];

const UserCharDetailsPage = () => {
    const { charId } = useParams<{ charId?: string }>(); // Permitir undefined
    const { userId } = useParams<{ userId?: string }>(); // Permitir undefined
    const { userChars, fetchUserItems, fetchUserCharsData } = useCharStore();
    const { showSnackbar } = useSnackbarStore();
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        if (userId && charId) {
            getUserCharDetails(userId, charId);
            fetchUserCharsData(userId);
        }
    }, [userId, charId]); // Adicionar dependências corretamente

    if (!charId) {
        return <>ID do personagem inválido...</>;
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const userChar = userChars.find(item => item.id === charId);

    const moveItemForUserInventory = async (item: { id: string }) => {
        try {
            await addItemToInventory(charId, {
                itemId: item.id,
                equipped: false,
                quantity: 1
            });
            await fetchUserItems(charId);
        } catch (error) {
            console.error('Erro ao mover item:', error);
            showSnackbar(error.message, 'success');

        }
    };

    const moveItemForWarehouseInventory = async (item: { id: string }) => {
        handleClickOpen();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
    
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '600px', md: '900px', lg: '1200px', xl: '1400px' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2, // Espaçamento entre os componentes
                    overflowY: 'auto',
                    padding: '10px',
                
                }}
            >
                {/* Primeira linha: UserCharDetailsView e Inventory charItens */}
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        gap: 2,
                        flex: 1
                    }}
                >
                    {/* UserCharDetailsView */}
                    <Box sx={{ flex: 1, minWidth: '300px'}}>
                        <UserCharDetailsView />
                    </Box>

                    {/* Inventory charItens */}
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                        <Inventory
                            hasChangeQuantity
                            hasOnEquip
                            hasMoveItem
                            hasOnUnequip
                            onMoveTitle="Mover para Armazém"
                            fetchType="charItens"
                            onMoveItem={moveItemForWarehouseInventory}
                        />
                    </Box>
                </Box>

                {/* Segunda linha: Inventory allItems */}
                <Box sx={{ flex: 1, mt: 1, mb: '40px' }}>
                    <Inventory
                        onMoveTitle={`Mover para ${userChar?.gameChar.name ?? 'Personagem'}`}
                        hasMoveItem
                        fetchType="allItems"
                        onMoveItem={moveItemForUserInventory}
                    />
                </Box>

                {/* Diálogo para feedback */}
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Em desenvolvimento. Disponível em breve
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>OK</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default UserCharDetailsPage;