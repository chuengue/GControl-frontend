import { Box, Stack } from '@mui/material';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { getUserCharDetails } from '../../service/requests/gameChar';
import { addItemToInventory } from '../../service/requests/inventory';
import Inventory from '../../shared/components/inventory/inventory';
import UserCharDetailsView from '../../shared/components/userCharDetailsView/userCharDetailsView';
import useCharStore from '../../stores/charStore';

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
    const { chardId } = useParams<{ chardId: string }>();
    const { userId } = useParams<{ userId: string }>();
    const { userChars, fetchUserItems } = useCharStore();

    useEffect(() => {
        getUserCharDetails(userId, chardId);
    }, []);

    // Verifica se chardId é válido
    if (!chardId) return <>Carregando...</>;

    const userChar = userChars.find(item => item.id === chardId);

    if (!userChar) return <>Personagem não encontrado...</>;

    const moveItemForUserInventory = async item => {
        console.log(item);
        const itemId = item.id;
        try {
            await addItemToInventory(chardId, {
                itemId,
                equipped: false,
                quantity: 1
            });
            await fetchUserItems(chardId);
        } catch (error) {
            console.error('Erro ao mover item:', error);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Detalhes do personagem e inventário equipado */}
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    gap: 2 // Usando espaçamento do Material-UI
                }}
            >
                <UserCharDetailsView />
                <Stack>
                    <Inventory
                        hasChangeQuantity
                        hasOnEquip
                        hasMoveItem
                        hasOnUnequip
                        onMoveTitle="Mover para Armazém"
                        fetchType="charItens"
                    />
                </Stack>
            </Box>

            {/* Inventário do jogador */}
            <Stack sx={{ mt: 3, height: '50%' }}>
                <Inventory
                    onMoveTitle={`Mover para ${userChar.gameChar.name}`}
                    hasMoveItem
                    fetchType="allItems"
                    onMoveItem={item => moveItemForUserInventory(item)}
                />
            </Stack>
        </Box>
    );
};

export default UserCharDetailsPage;
