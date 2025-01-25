'use client';
import { Button, Link, Stack, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { SignInPage } from '@toolpad/core/SignInPage';
import * as React from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import {
  signInWithCredentials,
  signInWithGithub,
  signInWithGoogle
} from '../firebase/auth';

export default function SignIn() {
    const { session, setSession, loading } = useSession();
    const navigate = useNavigate();

    if (loading) {
        return <LinearProgress />;
    }

    if (session) {
        return <Navigate to="/" />;
    }
    function SignUpLink() {
        return (
            <Stack flexDirection="row">
                <Typography variant="caption" sx={{ marginRight: 1 }}>
                    Ainda nao tem uma conta ?
                </Typography>
                <Link href="/sign-up" variant="body2">
                    <Typography variant="caption">Cadastre-se</Typography>
                </Link>
            </Stack>
        );
    }
    function Title() {
        return <h2 style={{ marginBottom: 8 }}>Login</h2>;
    }
    function SubTitle() {
        return <Typography sx={{marginBottom: 1}} >Bem-vindo, faça login para continuar</Typography>;
    }

    function CustomButton() {
      return (
        <Button
          type="submit"
          color="info"
          variant="contained"
          fullWidth
          sx={{ my: 2 }}
        >
          Entrar
        </Button>
      );
    }

    return (
        <SignInPage
            slots={{
                title: Title,
                subtitle: SubTitle,
                signUpLink: SignUpLink,
                submitButton: CustomButton

            }}
            providers={[
                { id: 'google', name: 'Google' },
                { id: 'credentials', name: 'Credentials' }
            ]}
            signIn={async (provider, formData, callbackUrl) => {
                let result;
                try {
                    if (provider.id === 'google') {
                        result = await signInWithGoogle();
                    }
                    if (provider.id === 'github') {
                        result = await signInWithGithub();
                    }
                    if (provider.id === 'credentials') {
                        const email = formData?.get('email') as string;
                        const password = formData?.get('password') as string;

                        if (!email || !password) {
                            return { error: 'Email and password are required' };
                        }

                        result = await signInWithCredentials(email, password);
                    }
                    console.log(result);
                    if (result?.success && result?.user) {
                        // Convert Firebase user to Session format
                        const userSession: Session = {
                            user: {
                                name: result.user.displayName || '',
                                email: result.user.email || '',
                                image: result.user.photoURL || '',
                                displayName: result.user.displayName || '',
                                uid: result.user.uid || ''
                            }
                        };
                        setSession(userSession);
                        navigate(callbackUrl || '/', { replace: true });
                        return {};
                    }
                    return { error: result?.error || 'Failed to sign in' };
                } catch (error) {
                    return {
                        error:
                            error instanceof Error
                                ? error.message
                                : 'An error occurred'
                    };
                }
            }}
        />
    );
}
