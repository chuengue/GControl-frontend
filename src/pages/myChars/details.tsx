import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { getUserCharDetails } from '../../service/requests/gameChar';
import Inventory from '../../shared/components/inventory/inventory';

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
    const { chardId } = useParams();
    const { userId } = useParams();

    useEffect(() => {
        getUserCharDetails(userId, chardId);
    }, []);

    return (
        <>
            <Inventory />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    p: 3,
                    background: '#2c2f33',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    color: '#fff'
                }}
            >
                {/* Equipamentos à esquerda */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mr: 3
                    }}
                >
                    {equipmentSlots.map(slot => (
                        <Card
                            key={slot}
                            sx={{
                                mb: 1,
                                width: 90,
                                height: 90,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#3b3e47',
                                color: '#f1c40f',
                                border: '2px solid #f1c40f',
                                borderRadius: '8px'
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="body2">{slot}</Typography>
                                <Avatar
                                    variant="square"
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        mt: 1,
                                        bgcolor: '#8e44ad'
                                    }}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Personagem no centro */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mx: 3
                    }}
                >
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#e74c3c' }}
                    >
                        Personagem
                    </Typography>
                    <Avatar
                        sx={{
                            width: 150,
                            height: 250,
                            mb: 3,
                            border: '3px solid #e74c3c'
                        }}
                        variant="square"
                    />
                    <Card
                        sx={{
                            width: 90,
                            height: 90,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#3b3e47',
                            color: '#f1c40f',
                            border: '2px solid #f1c40f',
                            borderRadius: '8px'
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">Arma</Typography>
                            <Avatar
                                variant="square"
                                sx={{
                                    width: 50,
                                    height: 50,
                                    mt: 1,
                                    bgcolor: '#3498db'
                                }}
                            />
                        </CardContent>
                    </Card>
                </Box>

                {/* Acessórios à direita */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 1,
                        ml: 3
                    }}
                >
                    {accessorySlots.map(slot => (
                        <Card
                            key={slot}
                            sx={{
                                width: 90,
                                height: 90,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#3b3e47',
                                color: '#f1c40f',
                                border: '2px solid #f1c40f',
                                borderRadius: '8px'
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="body2">{slot}</Typography>
                                <Avatar
                                    variant="square"
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        mt: 1,
                                        bgcolor: '#16a085'
                                    }}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
        </>
    );
};

export default UserCharDetailsPage;
