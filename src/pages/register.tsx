import {
    Alert,
    Box,
    Button,
    Container,
    LinearProgress,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { registerUser } from '../firebase/signUp';
import { useSession } from '../SessionContext';

const defaultFormFields = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickNameGC: ''
};

function Register() {
    const navigate = useNavigate();
    const { session, loading, setLoading } = useSession();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [formFields, setFormFields] = useState(defaultFormFields);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { displayName, nickNameGC, email, password, confirmPassword } = formFields;

    useEffect(() => {
        if (session) {
            navigate('/');
        }
    }, [session, navigate]);

    const resetFormFields = () => {
        setFormFields(defaultFormFields);
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            setLoading(true);
            await registerUser(displayName, email, password, nickNameGC);
            setSuccessMessage('Cadastro realizado com sucesso! Você será redirecionado.');
            resetFormFields();
            navigate('/');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setError('Este email já está em uso!');
            } else {
                setError('Ocorreu um erro inesperado. Por favor, tente novamente.');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormFields({ ...formFields, [name]: value });
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                backgroundImage: `url(/assets/images/World_map_gc.webp)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 2, sm: 4 }
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 0
                }}
            />
            
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        padding: { xs: 3, sm: 4 },
                        borderRadius: '24px',
                        backgroundColor: 'rgba(25, 118, 210, 0.95)',
                        backdropFilter: 'blur(12px)',
                        width: '100%',
                        maxWidth: '500px',
                        margin: '0 auto',
                        boxShadow: theme.shadows[8]
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        textAlign="center"
                        sx={{
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: { xs: '1.75rem', sm: '2rem' },
                            mb: 1
                        }}
                    >
                        Cadastro
                    </Typography>

                    <Typography
                        variant="body1"
                        textAlign="center"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            mb: 2,
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                    >
                        Crie sua conta no Chase Tracker
                    </Typography>

                    {error && (
                        <Alert 
                            severity="error"
                            sx={{
                                borderRadius: '12px',
                                '& .MuiAlert-message': {
                                    color: '#5f2120'
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert 
                            severity="success"
                            sx={{
                                borderRadius: '12px',
                                '& .MuiAlert-message': {
                                    color: '#1e4620'
                                }
                            }}
                        >
                            {successMessage}
                        </Alert>
                    )}

                    <TextField
                        label="Nome"
                        name="displayName"
                        value={displayName}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    />
                    <TextField
                        label="Nickname GC"
                        name="nickNameGC"
                        value={nickNameGC}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    />
                    <TextField
                        label="Senha"
                        name="password"
                        type="password"
                        value={password}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    />
                    <TextField
                        label="Confirmar Senha"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: '12px',
                            backgroundColor: 'white',
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                            }
                        }}
                    >
                        {loading ? 'Cadastrando...' : 'Criar Conta'}
                    </Button>

                    <Button
                        variant="text"
                        onClick={() => navigate('/sign-in')}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        Já tem uma conta? Faça login
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

export default Register;
