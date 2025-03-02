import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { createMission } from '../../service/requests/missions/missions';

const CreateMission: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        type: '',
        imgUrl: ''
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            await createMission({
                ...formData,
                level: Number(formData.level)
            });
            setSuccess(true);
            setFormData({
                name: '',
                level: '',
                type: '',
                imgUrl: ''
            });
            setTimeout(() => {
                navigate('/missions');
            }, 2000);
        } catch (err) {
            setError('Erro ao criar missão. Por favor, tente novamente.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Cadastrar Nova Missão
                </Typography>

                <Paper sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Missão criada com sucesso!
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Nome da Missão"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Nível"
                            name="level"
                            type="number"
                            value={formData.level}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Tipo"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="URL da Imagem"
                            name="imgUrl"
                            value={formData.imgUrl}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                            >
                                Cadastrar Missão
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                onClick={() => navigate('/missions')}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default CreateMission; 