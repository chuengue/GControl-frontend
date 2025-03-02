import { Backdrop, Box, Button, CircularProgress, Container, LinearProgress, Paper, TextField, Typography } from '@mui/material';
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

  return (
    <Account
      slotProps={{
        preview: {
          slotProps: {
            avatarIconButton: { sx: { border: '0' } },
            avatar: { src: session?.user.image }
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
  return (
    <Typography
      variant="caption"
      sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}
    >
      {mini ? '©' : `© ${new Date().getFullYear()} Chase Tracker V ${packageJson.version}`}
    </Typography>
  );
}

export default function Layout() {
  const { session, loading } = useSession();
  const location = useLocation();
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
