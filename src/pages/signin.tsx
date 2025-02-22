'use client';
import {
  Calculate as CalcIcon,
  SportsEsports as EquipIcon,
  Lock,
  Person as PersonIcon,
  TableChart,
  TrendingUp
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Grid, Link, Stack, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { blue, green, indigo, purple, red } from '@mui/material/colors';
import { SignInPage } from '@toolpad/core/SignInPage';
import * as React from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useSession } from '../SessionContext';
import { signInWithCredentials, signInWithGithub, signInWithGoogle } from '../firebase/auth';

export default function SignIn() {
  const { session, setSession, loading } = useSession();
  const navigate = useNavigate();

  if (loading) {
    return <LinearProgress />;
  }

  if (session) {
    return <Navigate to="/" />;
  }

  function SecurityMessage() {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
        <Lock sx={{ fontSize: '2rem', color: green[500], mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Sua segurança é nossa prioridade. Todos os dados são criptografados.
        </Typography>
      </Box>
    );
  }

  function FeaturesGrid() {
    return (
      <Stack sx={{ width: '100%', alignItems: 'center' }}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Card
            sx={{
              width: '100%',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              background: `linear-gradient(145deg, ${indigo[100]}, ${indigo[800]})`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <TableChart sx={{ fontSize: '3rem', color: '#1a237e', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: indigo[800] }}>
                Controle de Missões
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie o progresso das missões diárias e semanais dos seus personagens. Marque
                missões concluídas diretamente na tabela e mantenha o registro atualizado com
                facilidade.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Cards restantes (50% largura cada) */}
        <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          {[
            {
              icon: <PersonIcon sx={{ fontSize: '3rem', color: '#1976d2', mb: 2 }} />,
              title: 'Cadastro de Personagem',
              text: 'Cadastre seus personagens e mantenha um registro detalhado de cada um.',
              color: blue
            },
            {
              icon: <EquipIcon sx={{ fontSize: '3rem', color: '#388e3c', mb: 2 }} />,
              title: 'Controle de Farm',
              text: 'Registre suas sessões de farm, acompanhe os drops e calcule o tempo médio por item.',
              color: green
            },
            {
              icon: <CalcIcon sx={{ fontSize: '3rem', color: '#d32f2f', mb: 2 }} />,
              title: 'Calculadora de Ataque Total',
              text: 'Calcule o ataque total dos seus personagens e maximize seu poder de combate.',
              color: red
            },
            {
              icon: <TrendingUp sx={{ fontSize: '3rem', color: '#6a1b9a', mb: 2 }} />,
              title: 'Visualização de Gráficos',
              text: 'Acompanhe o desempenho dos seus personagens com gráficos de poder.',
              color: purple
            }
          ].map((feature, index) => (
            <Grid item xs={6} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  background: `linear-gradient(145deg, ${feature.color[100]}, ${feature.color[800]})`
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {feature.icon}
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: feature.color[800] }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }
  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: '100% !important',
        minHeight: '100vh',
        backgroundImage: `url(/assets/images/World_map_gc.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}
    >
      {/* Backdrop para escurecer o fundo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 0
        }}
      />

      {/* Container Principal */}
      <Grid
        container
        spacing={4}
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Coluna dos Cards (Centralizados) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <FeaturesGrid />
        </Grid>

        {/* Coluna do Login */}
        <Grid item xs={12} md={4}>
          <Box sx={{ maxWidth: '600px', width: '100%', mx: 'auto' }}>
            <SignInPage
              sx={{
                minHeight: 'unset',
                '& .MuiBox-root': {
                  padding: 2,
                  backgroundColor: blue[800] ,
                  borderRadius:"18px"
                }
              }}
              slots={{
                title: () => <h2 style={{ marginBottom: 8 }}>Login</h2>,
                subtitle: () => (
                  <Typography sx={{ marginBottom: 1 }}>
                  Seja bem-vindo ao Chase Tracker
                  </Typography>
                ),
                signUpLink: () => (
                  <Stack flexDirection="row">
                    <Typography variant="caption" sx={{ marginRight: 1 }}>
                      Ainda não tem uma conta?
                    </Typography>
                    <Link href="/sign-up" variant="body2">
                      <Typography variant="caption">Cadastre-se</Typography>
                    </Link>
                  </Stack>
                ),
                forgotPasswordLink: () => (
                  <Stack flexDirection="row">
                    <Link href="/forgot-password" variant="body2">
                      <Typography variant="caption">Esqueci minha senha</Typography>
                    </Link>
                  </Stack>
                ),
                submitButton: () => (
                  <Button type="submit" color="info" variant="contained" fullWidth sx={{ my: 2 }}>
                    Entrar
                  </Button>
                )
              }}
              providers={[
                { id: 'google', name: 'Google' },
                { id: 'credentials', name: 'Credentials' }
              ]}
              signIn={async (provider, formData, callbackUrl) => {
                try {
                  let result;
                  if (provider.id === 'google') result = await signInWithGoogle();
                  if (provider.id === 'github') result = await signInWithGithub();
                  if (provider.id === 'credentials') {
                    const email = formData?.get('email') as string;
                    const password = formData?.get('password') as string;
                    if (!email || !password) return { error: 'Email e senha são obrigatórios' };
                    result = await signInWithCredentials(email, password);
                  }

                  if (result?.success && result?.user) {
                    setSession({
                      user: {
                        name: result.user.displayName || '',
                        email: result.user.email || '',
                        image: result.user.photoURL || '',
                        uid: result.user.uid || '',
                        role: result.additionalData?.role || 'user',
                        nickname: result.additionalData?.nickNameGC || ''
                      }
                    });
                    navigate(callbackUrl || '/', { replace: true });
                    return {};
                  }

                  return { error: result?.error || 'Falha ao fazer login' };
                } catch (error) {
                  return {
                    error: error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
                  };
                }
              }}
            />
            <SecurityMessage />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
