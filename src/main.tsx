import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import ErrorPage from './components/ErrorPage';

import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import AboutPage from './pages/about/about';
import AddUserChar from './pages/addUserChar/addUserChar';
import AddLimitedMission from './pages/admin/addLimitedMissions';
import CharacterManagement from './pages/admin/characters';
import CreateItem from './pages/admin/createItem';
import CreateMission from './pages/admin/createMission';
import CreateSet from './pages/admin/createSet';
import RemoveItemPage from './pages/admin/removeItem';
import DailyControl from './pages/dailyControl/dailyControl';
import MissionHistoricPage from './pages/dailyControl/dailyControlHistoric';
import FarmSessionPage from './pages/dashboard/dashboard';
import FarmToolsPage from './pages/farmTools/farmTools';
import ForgotPassword from './pages/forgotPassword';
import GearTrackerPage from './pages/gearTracker/gearTracker';
import UserCharDetailsPage from './pages/myChars/details';
import MyChars from './pages/myChars/myChars';
import NotFound from './pages/NotFound';
import RankingPage from './pages/ranking/rankingPage';
import register from './pages/register';
import SignInPage from './pages/signin';
import PrivateRoute from './PrivateRoute';
import { initGA } from './utils/analytics';

// Initialize GA4
initGA();

const router = createBrowserRouter([
    {
        Component: App,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                Component: Layout,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: '',
                        Component: DashboardPage
                    },
                    {
                        path: 'admin',
                        children: [
                            {
                                path: 'characters',
                                Component: () => (
                                    <PrivateRoute adminOnly>
                                        <CharacterManagement />
                                    </PrivateRoute>
                                )
                            },
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
                                path: 'add-set',
                                Component: () => (
                                    <PrivateRoute adminOnly>
                                        <CreateSet />
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
                                path: 'details/:userId/:charId',
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
                        path: "gear-tracker",
                        children: [
                            {
                                path: "",
                                Component: GearTrackerPage
                            },
                            {
                                path: ":charId",
                                Component: GearTrackerPage
                            }
                        ]
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
                    {
                        path: '*',
                        Component: NotFound
                    }
                ]
            },
          
            {
                path: '/sign-in',
                Component: SignInPage,
                errorElement: <ErrorPage />
            },
            {
                path: '/sign-up',
                Component: register,
                errorElement: <ErrorPage />
            },
            {
                path: '/forgot-password',
                Component: ForgotPassword,
                errorElement: <ErrorPage />
            },
            {
                path: '*',
                Component: NotFound,
                errorElement: <ErrorPage />
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    </React.StrictMode>
);
