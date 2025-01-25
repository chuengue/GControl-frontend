import LinearProgress from '@mui/material/LinearProgress';
import { Account } from '@toolpad/core/Account';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import * as React from 'react';
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

export default function Layout() {
    const { session, loading } = useSession();
    const location = useLocation();
    if (loading) {
        return (
            <div style={{ width: '100%' }}>
                <LinearProgress />
            </div>
        );
    }

    if (!session) {
        const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
        return <Navigate to={redirectTo} replace />;
    }

    return (
        <DashboardLayout
            slots={{ toolbarAccount: CustomAccount }}
            disableCollapsibleSidebar
            
        >
            <PageContainer breadcrumbs={[]}>
                <Outlet />
            </PageContainer>
        </DashboardLayout>
    );
}
