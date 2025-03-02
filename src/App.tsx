import { AddCircle, AdminPanelSettings, Agriculture, DataSaverOn, Handyman, History, Home, Info, RemoveCircle, ShowChart, TableChartRounded } from '@mui/icons-material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import Groups2Icon from '@mui/icons-material/Groups2';
import PersonIcon from '@mui/icons-material/Person';
import { Box, GlobalStyles, Typography } from '@mui/material';

import type {
    Authentication,
    NavigationDividerItem,
    NavigationPageItem,
    NavigationSubheaderItem
} from '@toolpad/core/AppProvider';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import * as React from 'react';
import { Outlet } from 'react-router';
import theme from '../theme';
import { GlobalSnackbar } from './components/globalSnackBar/globalSnackBar';
import { firebaseSignOut, onAuthStateChanged } from './firebase/auth';
import SessionContext, { type Session } from './SessionContext';
import { getFilteredNavigationForUser } from './utils/sidebarItems';
export interface NavItemCustom extends NavigationPageItem {
    role?: string;
}

export type NavigationItemCustom =
    | NavItemCustom
    | NavigationSubheaderItem
    | NavigationDividerItem;

export type NavigationCustom = NavigationItemCustom[];

interface CustomNav extends NavigationCustom {
    role?: string;
}

export const NAVIGATION: CustomNav = [
    {
        kind: 'header',
        title: 'Chase Tracker'
    },
    {
        title: 'Home',
        icon: <Home />
    },
    {
        segment: 'chars',
        title: 'Personagens',
        icon: <Groups2Icon />,
        children: [
            {
                segment: 'my-chars',
                title: 'Meus Personagens',
                icon: <PersonIcon />
            },
            {
                segment: 'add-user-char',
                title: 'Adicionar Personagem',
                icon: <AddCircleRoundedIcon />
            }
        ]
    },
    {
        title: 'Sessões de Farm',
        segment:"farm-sessions",
        icon: < Agriculture />,
    },
    {
        title: 'Ferramenta de Farm',
        segment:"farm-tool",
        icon: < Handyman />,
    },
    {
        title: 'Controle Diário',
        segment:"daily-control",
        icon: < TableChartRounded />,
    },
    {
        title: 'Histórico de missões',
        segment:"missions-historic",
        icon: < History />,
    },   {
        title: 'Ranking',
        segment:"ranking",
        icon: < ShowChart />,
    },
    {
        title: 'Admin',
        segment: 'admin',
        role: 'admin',
        icon: <AdminPanelSettings />,
        children: [
            {
                segment: 'create-mission',
                title: 'Cadastrar Missão',
                icon: <AddCircle />
            },
            {
                segment: 'create-item',
                title: 'Adicionar Novo Item',
                icon: <AddCircle />
            },
            {
                segment: 'delete-item',
                title: 'Excluir Item',
                icon: <RemoveCircle />
            },
            {
                segment: 'add-limited-missions',
                title: 'Adicionar Missão Limitada',
                icon: <DataSaverOn />
            }
        ]
    },
    {
        title: 'Sobre',
        segment:"about",
        icon: < Info />,
        
    },
];

const BRANDING = {
    title: (
        <Typography
            sx={{
                fontFamily: 'Anton, sans-serif',
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #fff, #888)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}
        >
            Chase Tracker
        </Typography>
    ),
    logo: (
        <Box
            component="img"
            src="assets/images/logo.png"
            alt="Chase Tracker logo"
            sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.05)'
                }
            }}
        />
    )
};

const AUTHENTICATION: Authentication = {
    signIn: () => {},
    signOut: firebaseSignOut
};

export default function App() {
    const [session, setSession] = React.useState<Session | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [filteredNavigation, setFilteredNavigation] =
        React.useState<NavigationCustom>(NAVIGATION);

    const sessionContextValue = React.useMemo(
        () => ({
            session,
            setSession,
            loading,
            setLoading
        }),
        [session, loading]
    );

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(user => {
            if (user) {
                setSession({
                    user: {
                        name: user.name || '',
                        email: user.email || '',
                        image: user.image || '',
                        displayName: user.displayName || '',
                        uid: user.uid || '',
                        role: user.additionalData?.role || 'user',
                        nickname: user.additionalData?.nickNameGC || ''
                    }
                });
            } else {
                setSession(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        const fetchNavigation = async () => {
            const navigation = await getFilteredNavigationForUser();
            setFilteredNavigation(navigation);
        };

        fetchNavigation();
    }, [session]);

    return (
        <>
            <GlobalStyles
                styles={{
                    '*::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '*::-webkit-scrollbar-track': {
                        background: '#1e1e1e',
                    },
                    '*::-webkit-scrollbar-thumb': {
                        background: '#888',
                        borderRadius: '4px',
                    },
                    '*::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
                    },
                  
                }}
            />

            <ReactRouterAppProvider
                theme={theme}
                navigation={filteredNavigation}
                branding={BRANDING}
                session={session}
                authentication={AUTHENTICATION}
            >
                <SessionContext.Provider value={sessionContextValue}>
                    <GlobalSnackbar />
                    <Outlet />
                </SessionContext.Provider>
            </ReactRouterAppProvider>
        </>
    );
}
