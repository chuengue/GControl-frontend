import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { accessoriesOptions, armorTypeOptions } from '../../../pages/admin/consts';
import { EquipmentType, GrandChaseItem } from '../../../pages/admin/types';
import { getUserCharDetails } from '../../../service/requests/gameChar';
import useCharStore from '../../../stores/charStore';
import ItemBox from '../itemBox/itemBox';

const UserCharDetailsView = () => {
    const { chardId, userId } = useParams();
    const [userChar, setUserChar] = useState<any>(null);
    const { userItems, setUserItems } = useCharStore();

    useEffect(() => {
        const fetchUserCharDetails = async () => {
            try {
                const userCharDetails = await getUserCharDetails(
                    userId,
                    chardId
                );
                setUserChar(userCharDetails);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserCharDetails();
    }, [userId, chardId, userItems]);

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
                <Skeleton width="650px" height="100% "animation="wave" variant='rectangular' sx={{borderRadius:"12px"}}/> 
            </Box>
        )
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
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
                        const equippedItem =
                            userChar?.results.gameChar.equippedItems.find(
                                item => item.armorType === slot.value
                            );

                        const parsedItem = parseItem(equippedItem);

                        return (
                            <ItemBox
                                key={slot.value}
                                IsDefault={!parsedItem}
                                defaultType={slot.label as EquipmentType}
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
                            const equippedItem =
                                userChar?.results.gameChar.equippedItems.find(
                                    item => item.accessoryType === slot.value
                                );

                            const parsedItem = parseItem(equippedItem);

                            return (
                                <ItemBox
                                    key={slot.value}
                                    IsDefault={!parsedItem}
                                    defaultType={slot.label as EquipmentType}
                                    item={parsedItem || {}}
                                />
                            );
                        })}
                    </Box>
                </Box>
            </Box>

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
                <CardContent>
                    <Grid container spacing={0.5}>
                        {[
                            {
                                label: 'Ataque Total',
                                value: userChar?.results.atkTotal
                            },
                            {
                                label: 'Ataque',
                                value: userChar?.results.stats.attack
                            },
                            {
                                label: 'Ataque Especial',
                                value: userChar?.results.stats.specialAttack
                            },
                            {
                                label: 'Defesa',
                                value: userChar?.results.stats.defense
                            },
                            {
                                label: 'Defesa Especial',
                                value: userChar?.results.stats.specialDefense
                            },
                            { label: 'HP', value: userChar?.results.stats.hp },
                            {
                                label: 'Acerto Crítico',
                                value: userChar?.results.stats.criticalStrike
                            },
                            {
                                label: 'Dano Crítico',
                                value: userChar?.results.stats.criticalDamage
                            },
                            {
                                label: 'Recuperação MP',
                                value: userChar?.results.stats.recMP
                            },
                            {
                                label: 'Recuperação HP',
                                value: userChar?.results.stats.recHP
                            }
                        ].map(({ label, value }, index) => (
                            <Grid
                                item
                                xs={6} // Divide os itens em duas colunas
                                key={label}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                    >
                                        {label}:
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ marginRight: '5px' }}
                                    >
                                        {value
                                            ? value.toLocaleString('pt-BR') // Formata o número para o padrão brasileiro
                                            : 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UserCharDetailsView;
