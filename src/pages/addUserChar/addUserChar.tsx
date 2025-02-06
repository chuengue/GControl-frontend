import {
    Box,
    Button,
    Card,
    Container,
    Grid,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';

import TotalAtkCalculator from '../../components/atackTotalCalculator.ts/atackTotalCalculator';
import SelectableImage from '../../components/selectableImage/selectableImage';
import { Character } from '../../interfaces/char';
import { RegisterUserCharacter } from '../../service/requests/gameChar';
import { useSession } from '../../SessionContext';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';

function AddUserChar() {
    const { fetchAllCharsData, allChars, userChars, fetchUserCharsData } =
        useCharStore();
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);
    const { session } = useSession();
    const [atkTotal, setAtkTotal] = useState<string>('');
    const { showSnackbar } = useSnackbarStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [level, setLevel] = useState<string>('');

    const getOwnedCharIds = (charId: string) => {
        return userChars.some(userChar => userChar.gameChar.id === charId);
    };

    const getAllChars = async () => {
        if (!userChars || userChars.length === 0) {
            if (session) await fetchUserCharsData(session.user.uid);
        }
    };

    useEffect(() => {
        fetchAllCharsData();
        getAllChars();
    }, []);

    const handleSelectChar = (char: Character) => {
        if (char.id === selectedChar?.id) {
            setSelectedChar(null);
            setAtkTotal('');
            setLevel('');
        } else {
            setSelectedChar(char);
        }
    };

    const handleAtkTotalChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setAtkTotal(event.target.value);
    };

    const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLevel(event.target.value);
    };

    const handleRegister = async () => {
        setLoading(true);

        if (!session?.user.uid) {
            showSnackbar('Usuário não autenticado.', 'error', {
                vertical: 'top',
                horizontal: 'center'
            });
            return;
        }

        if (selectedChar) {
            const data = {
                charId: selectedChar.id,
                atkTotal: parseInt(atkTotal, 10),
                level: parseInt(level, 10)
            };

            try {
                await RegisterUserCharacter(
                    session.user.uid,
                    selectedChar.id,
                    data
                );
                fetchUserCharsData(session.user.uid);
                showSnackbar('Personagem registrado com sucesso!', 'success', {
                    vertical: 'top',
                    horizontal: 'center'
                });

                setSelectedChar(null);
                setAtkTotal('');
                setLevel('');
            } catch (err) {
                console.log(err.message);
                showSnackbar(err.message, 'error', {
                    vertical: 'top',
                    horizontal: 'center'
                });
            } finally {
                setLoading(false);
            }
        } else {
            showSnackbar('Nenhum personagem selecionado.', 'warning', {
                vertical: 'top',
                horizontal: 'center'
            });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={12}>
                    <Card
                        sx={{
                            p: 2,
                            bgcolor: blue[900],
                            borderRadius: '14px',
                            boxShadow: 3,
                            height: '100%'
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ color: 'white', mb: 2 }}
                            textAlign="center"
                            fontFamily="faktos, Roboto"
                        >
                            Selecione um Personagem
                        </Typography>
                        <Stack
                            direction="row"
                            flexWrap="wrap"
                            gap={1}
                            justifyContent="center"
                        >
                            {allChars.map(char => (
                                <SelectableImage
                                    key={char.id}
                                    char={char}
                                    disabled={getOwnedCharIds(char.id)}
                                    isSelected={selectedChar?.id === char.id}
                                    onSelect={handleSelectChar}
                                />
                            ))}
                        </Stack>
                    </Card>
                </Grid>

                {/* Coluna dos Detalhes do Personagem */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            p: 3,
                            borderRadius: '14px',
                            boxShadow: 3,
                            height: '100%'
                        }}
                    >
                        <Typography
                            variant="h5"
                            textAlign="center"
                            fontFamily="faktos, Roboto"
                        >
                            Detalhes do Personagem
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                width: '100%',
                                height: '100%',
                                marginTop: '80px'
                            }}
                        >
                            {selectedChar ? (
                                <Stack spacing={3} width="100%">
                                    <Card
                                        sx={{
                                            p: 2,
                                            bgcolor: blue[900],
                                            borderRadius: '14px',
                                            marginBottom: 2
                                        }}
                                    >
                                        <Typography
                                            variant="h4"
                                            fontFamily="faktos"
                                            textAlign="center"
                                            sx={{ color: 'white' }}
                                        >
                                            {selectedChar.name}
                                        </Typography>
                                    </Card>
                                    <TextField
                                        sx={{
                                            borderRadius: '5px'
                                        }}
                                        label="ATK Total"
                                        variant="outlined"
                                        fullWidth
                                        value={atkTotal}
                                        onChange={handleAtkTotalChange}
                                    />
                                    <TextField
                                        label="Level"
                                        variant="outlined"
                                        fullWidth
                                        value={level}
                                        onChange={handleLevelChange}
                                    />

                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        loading={loading}
                                        sx={{
                                            borderRadius: '8px',
                                            bgcolor: blue[700],
                                            '&:hover': {
                                                bgcolor: blue[800]
                                            }
                                        }}
                                        onClick={handleRegister}
                                    >
                                        Registrar
                                    </Button>
                                </Stack>
                            ) : (
                                <Card
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        borderRadius: '14px',
                                        boxShadow: 3,
                                        height: '50%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        color="textSecondary"
                                        textAlign="center"
                                        sx={{
                                            width: '100%'
                                        }}
                                    >
                                        Nenhum personagem selecionado.
                                    </Typography>
                                </Card>
                            )}
                        </Box>
                    </Card>
                </Grid>

                {/* Coluna do Calculador de ATK */}
                <Grid item xs={12} md={8}>
                    <Card
                        sx={{
                            p: 3,
                            borderRadius: '14px',
                            boxShadow: 3
                        }}
                    >
                        <TotalAtkCalculator />
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default AddUserChar;
