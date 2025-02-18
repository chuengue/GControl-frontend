import {
    Alert,
    Box,
    Button,
    Container,
    LinearProgress,
    TextField,
    Typography
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
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    padding: 4,
                    borderRadius: 1,
                    backgroundColor: 'background.paper',
                    width: '80%',
                    border: '1px solid grey',
                    boxShadow:
                        '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    textAlign="center"
                    fontFamily={'Faktos'}
                >
                    Esqueci Minha Senha
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}
              

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
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={loading}
                            fullWidth
                        >
                            Enviar Link de Redefinição
                        </Button>
                    </>
                ) : (
                    <Typography variant="body1" align="center" color="green">
                     {successMessage}
                    </Typography>
                )}

                <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={() => navigate('/')}
                    sx={{ marginTop: 2 }}
                >
                    Voltar para Login
                </Button>
            </Box>
        </Container>
    );
}

export default ForgotPassword;
