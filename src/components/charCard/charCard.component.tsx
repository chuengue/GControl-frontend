import { Avatar, Box, Card, Container, Stack, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import React from 'react';

// Tipagem de props para o componente
interface Character {
    name: string;
    level: number;
    classes: { img: string; className: string }[];
}

interface CharCardProps {
    chars: Character[]; // Espera um array de Character como prop
}

function ChardCard({ chars }: CharCardProps) {
    return (
        <Container>
            <Grid container spacing={2}>
                {chars.map((char, index) => {
                    return (
                        <Grid key={index} size={4}>
                            <Stack direction="column" spacing={2}>
                                <Card
                                    sx={{
                                        p: 2,
                                        maxWidth: 345,
                                        bgcolor: blue[900],
                                        borderRadius: '14px'
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
                                                {char.name}
                                            </Typography>
                                        </Stack>
                                    </Card>

                                    <Box display="flex" justifyContent="center">
                                        <img
                                            src={char.classes[0].img}
                                            alt={char.classes[0].className}
                                            height="200px"
                                        />
                                    </Box>
                                </Card>
                            </Stack>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
}

export default ChardCard;
