import {
    AddCircle,
    AdminPanelSettings,
    RemoveCircle
} from '@mui/icons-material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Groups2Icon from '@mui/icons-material/Groups2';
import PersonIcon from '@mui/icons-material/Person';

import type {
    Authentication,
    NavigationDividerItem,
    NavigationPageItem,
    NavigationSubheaderItem
} from '@toolpad/core/AppProvider';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import * as React from 'react';
import { Outlet } from 'react-router';
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
        title: 'Gcontrol'
    },
    {
        title: 'Dashboard',
        icon: <DashboardIcon />
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
        title: 'Admin',
        segment: 'admin',
        role: 'admin',
        icon: <AdminPanelSettings />,
        children: [
            {
                segment: 'create-item',
                title: 'Adicionar Novo Item',
                icon: <AddCircle />
            },
            {
                segment: 'delete-item',
                title: 'Excluir Item',
                icon: <RemoveCircle />
            }
        ]
    }
];

const BRANDING = {
    title: 'teste-gc-with-firebase'
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
        <ReactRouterAppProvider
            navigation={filteredNavigation}
            branding={BRANDING}
            session={session}
            authentication={AUTHENTICATION}
        >
            <GlobalSnackbar />
            <SessionContext.Provider value={sessionContextValue}>
                <Outlet />
            </SessionContext.Provider>
        </ReactRouterAppProvider>
    );
}
