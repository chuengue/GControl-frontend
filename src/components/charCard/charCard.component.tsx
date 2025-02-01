import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import {
    Avatar,
    Box,
    Button,
    Card,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { blue } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { UserCharCardProps } from '../../interfaces/char';

// Tipagem de props para o componente

function CharCard({
    chars,
    onAddCharacter,
    details = true
}: UserCharCardProps) {
    return (
        <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            width="100vw"
        >
            {chars.map((char, index) => (
                <Grid size={4} key={index}>
                    <Stack
                        direction="column"
                        spacing={2}
                        sx={{ height: '100%' }}
                    >
                        <Card
                            sx={{
                                p: 2,
                                bgcolor: blue[900],
                                borderRadius: '14px',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}
                        >
                            <Card
                                elevation={2}
                                sx={{
                                    bgcolor: blue[800],
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    borderRadius: '12px',
                                    p: 2
                                }}
                            >
                                {char.level && (
                                    <Stack>
                                        <Typography variant="body2">
                                            Level
                                        </Typography>
                                        <Avatar
                                            sx={{
                                                bgcolor: blue[500],
                                                color: 'white'
                                            }}
                                        >
                                            {char.level}
                                        </Avatar>
                                    </Stack>
                                )}

                                <Stack
                                    flexDirection="row"
                                    justifyContent="center"
                                    display="flex"
                                >
                                    <Typography
                                        variant="h4"
                                        fontFamily={'faktos'}
                                    >
                                        {char.gameChar.name}
                                    </Typography>
                                </Stack>
                            </Card>

                            <Box
                                display="flex"
                                justifyContent="center"
                                sx={{ flexGrow: 1 }}
                            >
                                {char.gameChar.classes.length > 0 && (
                                    <img
                                        src={char.gameChar.classes[0].img}
                                        alt={char.gameChar.classes[0].className}
                                        width="200px"
                                    />
                                )}
                            </Box>
                            {details && (
                                <>
                                    <Card
                                        elevation={2}
                                        sx={{
                                            bgcolor: blue[800],
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-around',
                                            borderRadius: '12px',
                                            p: 1,
                                            mt: 1
                                        }}
                                    >
                                        <Stack>
                                            <Typography sx={{ color: 'white' }}>
                                                Ataque Total: {char.atkTotal}
                                            </Typography>
                                        </Stack>
                                    </Card>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddCircleRoundedIcon />}
                                        sx={{
                                            bgcolor: blue[600],
                                            color: 'white',
                                            borderRadius: '12px',
                                            p: 1,
                                            mt: 1
                                        }}
                                    >
                                        Ver detalhes
                                    </Button>
                                </>
                            )}
                        </Card>
                    </Stack>
                </Grid>
            ))}

            {/* Card para adicionar personagem */}
            <Grid size={4}>
                <Card
                    sx={{
                        p: 2,
                        bgcolor: blue[700],
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%' // Garantindo que o card de adição ocupe toda a altura disponível
                    }}
                >
                    <Tooltip title="Adiciona Personagem">
                        <IconButton onClick={onAddCharacter} size="large">
                            <AddCircleRoundedIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Card>
            </Grid>
        </Grid>
    );
}

export default CharCard;
