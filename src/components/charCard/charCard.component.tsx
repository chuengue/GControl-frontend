import { Avatar, Box, Card, Container, Stack, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import React from 'react';
const char = [
    {
        uuid: '12a7b9fa-4f94-4d41-9430-8c3ec1b7dc1c',
        name: 'Lass',
        classes: [
            {
                className: 'Ladrão',
                img: 'https://s3.amazonaws.com/gc-control-imgs/Character_1/Lass_00.png'
            },
            {
                className: 'Ninja',
                img: 'https://static.wikia.nocookie.net/grandchase/images/f/fb/Las22.png/revision/latest?cb=20160917000359&path-prefix=pt-br'
            },
            {
                className: 'Assassino',
                img: 'https://static.wikia.nocookie.net/grandchase/images/2/29/Las28.png/revision/latest?cb=20160917000146&path-prefix=pt-br'
            },
            {
                className: 'Mercenário',
                img: 'https://static.wikia.nocookie.net/grandchase/images/4/4e/Las35.png/revision/latest?cb=20160917000943&path-prefix=pt-br'
            }
        ],

        level: 85
    },
    {
        uuid: '12a7b9fa-4f94-4d41-9430-8c3ec1b7dc1c',
        name: 'Lass',
        classes: [
            {
                className: 'Ladrão',
                img: 'https://s3.amazonaws.com/gc-control-imgs/Character_1/Lass_00.png'
            },
            {
                className: 'Ninja',
                img: 'https://static.wikia.nocookie.net/grandchase/images/f/fb/Las22.png/revision/latest?cb=20160917000359&path-prefix=pt-br'
            },
            {
                className: 'Assassino',
                img: 'https://static.wikia.nocookie.net/grandchase/images/2/29/Las28.png/revision/latest?cb=20160917000146&path-prefix=pt-br'
            },
            {
                className: 'Mercenário',
                img: 'https://static.wikia.nocookie.net/grandchase/images/4/4e/Las35.png/revision/latest?cb=20160917000943&path-prefix=pt-br'
            }
        ],

        level: 85
    }
];

function ChardCard() {
    return (
        <Container>
            <Grid container spacing={2}>
                {char.map(char => {
                    return (
                        <Grid size={4}>
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
                                            borderRadius: '12px',
                                            p: 2,
                                            
                                        }}
                                    >
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
                                        <Stack
                                            flexDirection="row"
                                            justifyContent="center"
                                            display="flex"
                                            width="80%"
                                        >
                                            <Typography
                                                variant="h4"
                                                fontFamily={'faktos'}
                                            >
                                                {char.name}
                                            </Typography>
                                        </Stack>
                                    </Card>

                                    <Box
                                        display="flex"
                                        justifyContent="center "
                                    >
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
