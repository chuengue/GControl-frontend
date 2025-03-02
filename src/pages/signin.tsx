'use client';
import {
  Calculate as CalcIcon,
  SportsEsports as EquipIcon,
  Lock,
  Person as PersonIcon,
  TableChart,
  TrendingUp
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, CircularProgress, Grid, Link, Stack, Typography } from '@mui/material';
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
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  if (loading) {
    return <LinearProgress />;
  }

  if (session) {
    return <Navigate to="/" />;
  }

  function LogoSection() {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          p: { xs: 2, sm: 4 },
          zIndex: 2,
          
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            
          }}
        >
          <img
            src="/assets/images/logo.png"
            alt="Chase Tracker Logo"
            style={{
              height: '40px',
              width: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.3))'
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.05em',
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              
            }}
          >
            Chase Tracker
          </Typography>
        </Box>
       
      </Box>
    );
  }

  function SecurityMessage() {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <Lock sx={{ fontSize: '1.2rem', color: green[500] }} />
          Sua segurança é nossa prioridade. Todos os dados são criptografados.
        </Typography>
      </Box>
    );
  }

  function FeaturesGrid() {
    return (
      <Stack sx={{ width: '100%', alignItems: 'center' }}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 4 }, width: '100%' }}>
          <Card
            sx={{
              width: '100%',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)',
              background: `linear-gradient(145deg, ${indigo[100]}, ${indigo[800]})`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <TableChart 
                sx={{ 
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, 
                  color: '#1a237e', 
                  mb: { xs: 2, md: 3 },
                  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))'
                }} 
              />
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  color: indigo[800], 
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  mb: { md: 2 }
                }}
              >
                Controle de Missões
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Gerencie o progresso das missões diárias e semanais dos seus personagens com facilidade e eficiência.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            '& .MuiGrid-item': {
              display: 'flex'
            }
          }}
        >
          {[
            {
              icon: <PersonIcon sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, color: '#1976d2', mb: { xs: 2, md: 3 }, filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))' }} />,
              title: 'Cadastro de Personagem',
              text: 'Cadastre seus personagens e mantenha um registro detalhado de cada um.',
              color: blue
            },
            {
              icon: <EquipIcon sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, color: '#388e3c', mb: { xs: 2, md: 3 }, filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))' }} />,
              title: 'Controle de Farm',
              text: 'Registre suas sessões de farm, acompanhe os drops e calcule o tempo médio por item.',
              color: green
            },
            {
              icon: <CalcIcon sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, color: '#d32f2f', mb: { xs: 2, md: 3 }, filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))' }} />,
              title: 'Calculadora de Ataque Total',
              text: 'Calcule o ataque total dos seus personagens e maximize seu poder de combate.',
              color: red
            },
            {
              icon: <TrendingUp sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, color: '#6a1b9a', mb: { xs: 2, md: 3 }, filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))' }} />,
              title: 'Visualização de Gráficos',
              text: 'Acompanhe o desempenho dos seus personagens com gráficos de poder.',
              color: purple
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '24px',
                  textAlign: 'center',
                  boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)',
                  background: `linear-gradient(145deg, ${feature.color[100]}, ${feature.color[800]})`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {feature.icon}
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      color: feature.color[800],
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                      mb: { md: 2 }
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                      lineHeight: 1.6
                    }}
                  >
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
      <LogoSection />
      {/* Backdrop para escurecer o fundo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 0
        }}
      />

      {/* Container Principal */}
      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: { xs: 12, sm: 8 },
          px: { xs: 2, sm: 3 }
        }}
      >
        {/* Coluna dos Cards (Centralizados) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <FeaturesGrid />
        </Grid>

        {/* Coluna do Login */}
        <Grid item xs={12} sm={8} md={4}>
          <Box sx={{ maxWidth: '600px', width: '100%', mx: 'auto' }}>
            <SignInPage
              sx={{
                minHeight: 'unset',
                '& .MuiBox-root': {
                  padding: { xs: 2, sm: 3 },
                  backgroundColor: blue[800],
                  borderRadius: "18px"
                },
                '& img': {  // Hide the default logo
                  display: 'none'
                },
                '& > div': {  // Adjust spacing after removing logo
                  marginTop: 0
                },
                '& .MuiTextField-root': {
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }
              }}
              slots={{
                title: () => (
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      marginBottom: 2,
                      paddingTop: 2,
                      color: 'white',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    Login
                  </Typography>
                ),
                subtitle: () => (
                  <Typography 
                    sx={{ 
                      marginBottom: 3,
                      color: 'rgba(255, 255, 255, 0.8)',
                      textAlign: 'center'
                    }}
                  >
                    Seja bem-vindo ao Chase Tracker
                  </Typography>
                ),
                signUpLink: () => (
                  <Stack flexDirection="column" alignItems="center">
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
                  <Button 
                    type="submit" 
                    color="info" 
                    variant="contained" 
                    fullWidth 
                    disabled={isLoggingIn}
                    sx={{ 
                      my: 2,
                      position: 'relative',
                      '&.Mui-disabled': {
                        backgroundColor: blue[600],
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }}
                  >
                    {isLoggingIn ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{
                            position: 'absolute',
                            left: '50%',
                            marginLeft: '-12px'
                          }}
                        />
                        <span style={{ opacity: 0 }}>Entrar</span>
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                )
              }}
              providers={[
                { id: 'google', name: 'Google' },
                { id: 'credentials', name: 'Credentials' }
              ]}
              signIn={async (provider, formData, callbackUrl) => {
                try {
                  setIsLoggingIn(true);
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
                } finally {
                  setIsLoggingIn(false);
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
