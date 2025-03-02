import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import AboutPage from './pages/about/about';
import AddUserChar from './pages/addUserChar/addUserChar';
import AddLimitedMission from './pages/admin/addLimitedMissions';
import CreateItem from './pages/admin/createItem';
import CreateMission from './pages/admin/createMission';
import RemoveItemPage from './pages/admin/removeItem';
import DailyControl from './pages/dailyControl/dailyControl';
import MissionHistoricPage from './pages/dailyControl/dailyControlHistoric';
import FarmSessionPage from './pages/dashboard/dashboard';
import FarmToolsPage from './pages/farmTools/farmTools';
import ForgotPassword from './pages/forgotPassword';
import UserCharDetailsPage from './pages/myChars/details';
import MyChars from './pages/myChars/myChars';
import RankingPage from './pages/ranking/rankingPage';
import register from './pages/register';
import SignInPage from './pages/signin';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
    {
        Component: App,
        children: [
            {
                path: '/',
                Component: Layout,
                children: [
                    {
                        path: '',
                        Component: DashboardPage
                    },
                    {
                        path: 'admin',
                        children: [
                            {
                                path: 'create-item',
                                Component: () => (
                                    <PrivateRoute adminOnly>
                                        <CreateItem />
                                    </PrivateRoute>
                                )
                            },
                            {
                                path: 'delete-item',
                                Component: () => (
                                    <PrivateRoute adminOnly>
                                        <RemoveItemPage />
                                    </PrivateRoute>
                                )
                            },
                            {
                                path: 'add-limited-missions',
                                Component: () => (
                                    <PrivateRoute adminOnly>
                                        <AddLimitedMission />
                                    </PrivateRoute>
                                )
                            },
                            {
                                path: 'create-mission',
                                Component: () => (
                                    <PrivateRoute adminOnly>
                                        <CreateMission />
                                    </PrivateRoute>
                                )
                            }
                        ]
                    },
                    {
                        path: 'chars',
                        children: [
                            {
                                path: 'my-chars',
                                Component: MyChars
                            },
                            {
                                path: 'details/:userId/:chardId',
                                Component: UserCharDetailsPage
                            },
                            {
                                path: 'add-user-char',
                                Component: AddUserChar
                            }
                        ]
                    },
                    {
                        path: 'farm-sessions',
                       Component: FarmSessionPage
                    },
                    {
                        path: 'daily-control',
                       Component: DailyControl
                    },
                    {
                        path: 'missions-historic',
                       Component: MissionHistoricPage
                    },
                    {
                        path: 'farm-tool',
                       Component: FarmToolsPage
                    },
                    {
                        path: 'ranking',
                       Component: RankingPage
                    },
                    {
                        path: 'about',
                       Component: AboutPage
                    },
                ]
            },
          
            {
                path: '/sign-in',
                Component: SignInPage
            },
            {
                path: '/sign-up',
                Component: register
            },
            {
                path: '/forgot-password',
                Component: ForgotPassword
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
