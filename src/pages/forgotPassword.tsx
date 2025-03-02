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
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { firebaseAuth } from '../firebase/firebaseConfig'; // Assumindo que você tenha o Firebase configurado

const defaultFormFields = {
    email: ''
};

function ForgotPassword() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [formFields, setFormFields] = useState(defaultFormFields);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const { email } = formFields;

    const resetFormFields = () => {
        setFormFields(defaultFormFields);
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
            await sendPasswordResetEmail(firebaseAuth, email);
            setSuccessMessage('Email de redefinição de senha enviado! Verifique sua caixa de entrada.');
            setEmailSent(true);
        } catch (error: any) {
            setError('Ocorreu um erro. Por favor, tente novamente.');
            console.error(error);
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
                        Esqueci Minha Senha
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
                        Digite seu email para receber o link de redefinição de senha
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

                    {!emailSent ? (
                        <>
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
                                Enviar Link de Redefinição
                            </Button>
                        </>
                    ) : (
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

                    <Button
                        variant="text"
                        onClick={() => navigate('/sign-in')}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            mt: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        Voltar para Login
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

export default ForgotPassword;
