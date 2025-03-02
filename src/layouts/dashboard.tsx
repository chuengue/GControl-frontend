import { alpha, Backdrop, Box, Button, CircularProgress, Container, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Account } from '@toolpad/core/Account';
import { DashboardLayout, SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import packageJson from "../../package.json";
import { useSession } from '../SessionContext';

function CustomAccount() {
  const { session } = useSession();
  const theme = useTheme();

  return (
    <Account
      slotProps={{
        preview: {
          sx: {
            '& .MuiPaper-root': {
              mt: 1.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.85)}, ${alpha(theme.palette.background.paper, 0.95)})`,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              borderRadius: '16px',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
              padding: '12px',
              minWidth: '240px',
              '& .MuiMenuItem-root': {
                borderRadius: '16px',
                margin: '4px 8px',
                padding: '12px 16px',
                gap: '12px',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                  '&::before': {
                    opacity: 1,
                    transform: 'scaleX(1)',
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '100%',
                  height: '2px',
                  background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0)}, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.primary.main, 0)})`,
                  opacity: 0,
                  transform: 'scaleX(0.5)',
                  transition: 'all 0.3s ease',
                },
                '& .MuiSvgIcon-root': {
                  color: alpha(theme.palette.primary.main, 0.7),
                  fontSize: '1.2rem',
                  transition: 'all 0.2s ease',
                },
                '& .MuiTypography-root': {
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: alpha(theme.palette.text.primary, 0.9),
                  letterSpacing: '0.01em'
                },
                '&:last-child': {
                  marginTop: '8px',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -8,
                    left: '5%',
                    right: '5%',
                    height: '1px',
                    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0)}, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0)})`,
                  },
                  '& .MuiSvgIcon-root': {
                    color: alpha(theme.palette.primary.light, 0.7),
                  },
                  '& .MuiTypography-root': {
                    color: alpha(theme.palette.primary.light, 0.9),
                    fontWeight: 600
                  },
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.15)})`,
                    '&::before': {
                      background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0)}, ${alpha(theme.palette.primary.main, 0.4)}, ${alpha(theme.palette.primary.main, 0)})`,
                    }
                  }
                }
              }
            }
          },
          slotProps: {
            avatarIconButton: { 
              sx: { 
                position: 'relative',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.1)}, ${alpha(theme.palette.background.paper, 0.2)})`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: '50%',
                padding: '4px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.05) translateY(-2px)',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                  boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.2)}`
                },
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }
            },
            avatar: { 
              src: session?.user.image,
              sx: {
                width: 40,
                height: 40,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: `2px solid ${theme.palette.primary.main}`
                }
              }
            }
          }
        },
        popover: {
          PaperProps: {
            sx: {
              mt: 1.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.85)}, ${alpha(theme.palette.background.paper, 0.95)})`,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              borderRadius: '16px',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
              padding: '12px',
              minWidth: '240px'
            }
          }
        },
        signOutButton: {
          sx: {
            borderRadius: '10px',
            margin: '4px 8px',
            padding: '12px 16px',
            gap: '12px',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
            color: theme.palette.primary.light,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.15)})`,
            },
            '& .MuiSvgIcon-root': {
              color: alpha(theme.palette.primary.light, 0.8),
              fontSize: '1.2rem'
            }
          }
        }
      }}
    />
  );
}

function useUserData(uid: string | undefined) {
  const [nickNameGC, setNickNameGC] = React.useState('');
  const [isChecking, setIsChecking] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [error, setError] = React.useState(false);

  const db = getFirestore();

  React.useEffect(() => {
    if (!uid) {
      setIsChecking(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', uid);

        // Definir um timeout para evitar loop infinito
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

        const userDoc = await getDoc(userDocRef);
        clearTimeout(timeoutId);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNickNameGC(userData.nickNameGC || '');
          setOpenModal(!userData.nickNameGC);
        } else {
          setOpenModal(true);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setError(true);
      } finally {
        setIsChecking(false);
      }
    };

    fetchUserData();
  }, [uid, db]);

  return {
    nickNameGC,
    setNickNameGC,
    isChecking,
    openModal,
    setOpenModal,
    error
  };
}

function RegistrationModal({
  open,
  onClose,
  nickNameGC,
  setNickNameGC,
  onSave,
  isSaving
}) {
  return (
    <Backdrop open={open} style={{ zIndex: 1300 }}>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '400px',
          margin: '0 auto',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#1976d2',
          color: '#fff'
        }}
      >
        <Typography
          variant="h4"
          fontFamily="faktos"
          gutterBottom
          sx={{ pt: 1 }}
        >
          Complete seu cadastro
        </Typography>
        <Container
          sx={{
            p: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <TextField
            label="Nickname"
            variant="outlined"
            value={nickNameGC}
            onChange={e => setNickNameGC(e.target.value)}
            sx={{
              marginBottom: '16px',
              width: '100%',
              marginTop: '20px'
            }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={onSave}
            disabled={isSaving || !nickNameGC}
            sx={{ width: '100%', marginTop: '16px' }}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </Container>
      </Paper>
    </Backdrop>
  );
}

function SidebarFooter({ mini }: SidebarFooterProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: mini ? 1 : 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(8px)',
      }}
    >
      <Typography
        variant="caption"
        sx={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden',
          color: alpha(theme.palette.text.primary, 0.7),
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        {mini ? '©' : `© ${new Date().getFullYear()} Chase Tracker V ${packageJson.version}`}
      </Typography>
    </Box>
  );
}

export default function Layout() {
  const { session, loading } = useSession();
  const location = useLocation();
  const theme = useTheme();
  const { nickNameGC, setNickNameGC, isChecking, openModal, setOpenModal, error } =
    useUserData(session?.user?.uid);
  const [isSaving, setIsSaving] = React.useState(false);
  const db = getFirestore();

  const handleSaveNickname = async () => {
    setIsSaving(true);
    try {
      if (session?.user?.uid) {
        await setDoc(doc(db, 'users', session.user.uid), {
          ...session.user,
          nickNameGC
        });

        setOpenModal(false);
      }
    } catch (error) {
      console.error('Error saving nickname:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isChecking) {
    return <LinearProgress sx={{ width: '100%' }} />;
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Não foi possível conectar ao servidor.
        </Typography>
        <Typography variant="body1">
          Verifique sua conexão ou tente novamente mais tarde.
        </Typography>
      </Container>
    );
  }

  if (!session) {
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <DashboardLayout
      slots={{
        toolbarAccount: CustomAccount,
        toolbarActions: () => <></>,
        sidebarFooter: SidebarFooter,
      }}
    >
      <RegistrationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        nickNameGC={nickNameGC}
        setNickNameGC={setNickNameGC}
        onSave={handleSaveNickname}
        isSaving={isSaving}
      />
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Background Image and Overlay */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(/assets/images/World_map_gc.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 1,
          }}
        />
        
        {/* Content Container */}
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            overflowY: 'auto',
            zIndex: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
              },
            },
          }}
        >
          <PageContainer
            breadcrumbs={[]}
            title=""
            sx={{
              maxWidth: '100% !important',
            }}
          >
            <Outlet />
          </PageContainer>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
