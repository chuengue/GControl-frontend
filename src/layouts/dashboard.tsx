import {
    Backdrop,
    Button,
    CircularProgress,
    Container,
    LinearProgress,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import { Account } from '@toolpad/core/Account';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
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
    const db = getFirestore();

    React.useEffect(() => {
        if (!uid) return;

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();

                if (userData?.nickNameGC) {
                    setOpenModal(false);
                } else {
                    setOpenModal(true);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsChecking(false);
            }
        };

        fetchUserData();
    }, [uid, db]);

    return { nickNameGC, setNickNameGC, isChecking, openModal, setOpenModal };
}

export default function Layout() {
    const { session, loading, setSession } = useSession();
    const location = useLocation();
    const { nickNameGC, setNickNameGC, isChecking, openModal, setOpenModal } =
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

    if (loading) {
        return <LinearProgress sx={{ width: '100%' }} />;
    }

    if (!session) {
        const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
        return <Navigate to={redirectTo} replace />;
    }

    return (
        <DashboardLayout
            slots={{
                toolbarAccount: CustomAccount,
                toolbarActions: () => <></>
            }}
            disableCollapsibleSidebar
        >
            {openModal && (
                <Backdrop open={openModal} style={{ zIndex: 1300 }}>
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
                                onClick={handleSaveNickname}
                                disabled={isSaving || !nickNameGC}
                                sx={{ width: '100%', marginTop: '16px' }}
                            >
                                {isSaving ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    'Salvar'
                                )}
                            </Button>
                        </Container>
                    </Paper>
                </Backdrop>
            )}
            <PageContainer breadcrumbs={[]}>
                <Outlet />
            </PageContainer>
        </DashboardLayout>
    );
}
