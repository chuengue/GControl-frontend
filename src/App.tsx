import DashboardIcon from '@mui/icons-material/Dashboard';
import Groups2Icon from '@mui/icons-material/Groups2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Authentication, Navigation } from '@toolpad/core/AppProvider';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import * as React from 'react';
import { Outlet } from 'react-router';
import { firebaseSignOut, onAuthStateChanged } from './firebase/auth';
import SessionContext, { type Session } from './SessionContext';
const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'my-chars',
    title: 'Meus Personagens',
    icon: <Groups2Icon />,
  },
];

const BRANDING = {
  title: "teste-gc-with-firebase",
};

const AUTHENTICATION: Authentication = {    
  signIn: () => {},
  signOut: firebaseSignOut,
};

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  const sessionContextValue = React.useMemo(
    () => ({
      session,
      setSession,
      loading,
      setLoading
    }),
    [session, loading],
  );

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setSession({
          user: {
            name: user.name || '',
            email: user.email || '',
            image: user.image || '',
            displayName: user.displayName || '',
            uid: user.uid || '',
          },
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={BRANDING}
      session={session}
      authentication={AUTHENTICATION}
    >
      <SessionContext.Provider value={sessionContextValue}>
        <Outlet />
      </SessionContext.Provider>
    </ReactRouterAppProvider>
  );
}