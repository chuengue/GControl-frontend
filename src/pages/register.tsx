import {
    Alert,
    Box,
    Button,
    Container,
    LinearProgress,
    TextField,
    Typography
} from '@mui/material';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { registerUser } from '../firebase/signUp';
import { useSession } from '../SessionContext';

const defaultFormFields = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
};

function Register() {
    const navigate = useNavigate();
    const { session, loading, setLoading} = useSession();

    const [formFields, setFormFields] = useState(defaultFormFields);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { displayName, email, password, confirmPassword } = formFields;

    // Redireciona se o usuário já estiver autenticado
    useEffect(() => {
        if (session) {
            navigate('/'); // Redireciona para a página inicial caso o usuário já tenha uma sessão
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
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            await registerUser(displayName, email, password);
            setSuccessMessage('Registration successful! You are now logged in.');
            resetFormFields();
            navigate('/'); 
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setError('Email already exists!');
            } else {
                setError('An unexpected error occurred. Please try again.');
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
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
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
                    backgroundColor: "background.paper",
                    width: "80%",
                    border: "1px solid grey",
                    boxShadow:
                        "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
                }}
            >
                <Typography variant="h4" component="h1" textAlign="center" fontFamily={"Faktos"}>
                    Cadastro
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}

                <TextField
                    label="Name"

                    name="displayName"
                    value={displayName}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handleChange}
                    fullWidth
                    required
                />
                <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                />

                <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} fullWidth >
                    Register
                </Button>
            </Box>
        </Container>
    );
}

export default Register;
