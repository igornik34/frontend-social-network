import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dropzone/styles.css';
import 'dayjs/locale/ru';
import './index.css'

import customParseFormat from 'dayjs/plugin/customParseFormat'
import dayjs from 'dayjs'
import { createRoot } from 'react-dom/client'
import { createTheme, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import {Provider} from "react-redux";
import {setupStore, store} from "./store/store.ts";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import {AuthPage} from "../pages/auth/AuthPage.tsx";
import {RegisterForm} from "../modules/auth/components/RegisterForm/RegisterForm.tsx";
import {LoginForm} from "../modules/auth/components/LoginForm/LoginForm.tsx";
import {Notifications} from "@mantine/notifications";
import {AuthRouter} from "../modules/auth/routes.ts";
import {AuthProvider} from "../modules/auth/context/AuthContext.tsx";
import {MainLayout} from "../layouts/MainLayout/MainLayout.tsx";
import {FeedPage} from "../pages/feed/FeedPage.tsx";
import {FollowersPage} from "../pages/followers/FollowersPage.tsx";
import {FollowingsPage} from "../pages/followings/FollowingsPage.tsx";
import {UserByIdPage} from "../pages/users/UserByIdPage.tsx";
import {TabFollowers} from "../modules/users/components/TabFollowers/TabFollowers.tsx";
import {TabFollowing} from "../modules/users/components/TabFollowing/TabFollowing.tsx";
import {TabPosts} from "../modules/users/components/TabPosts/TabPosts.tsx";
import {MessengerPage} from "../pages/messenger/MessengerPage.tsx";
import {ChatByIdPage} from "../pages/messenger/ChatByIdPage.tsx";
import {NotificationProvider} from "../modules/notifications/context/notification.context.tsx";
import {NotificationsPage} from "../pages/notifications/NotificationsPage.tsx";
import {UsersPage} from "../pages/users/UsersPage.tsx";
import {CallProvider} from "../modules/calls/context/call.context.tsx";

const theme = createTheme({
    primaryColor: 'indigo',
});

const routes = createBrowserRouter([
    {
        path: AuthRouter.baseRoute,
        element: <AuthPage />,
        children: [
            {
                path: AuthRouter.routes.register,
                element: <RegisterForm />
            },
            {
                path: AuthRouter.routes.login,
                element: <LoginForm />
            }
        ]
    },
    {
        path: '/',
        element: <AuthProvider>
            <NotificationProvider>
                <CallProvider>
                    <MainLayout />
                </CallProvider>
            </NotificationProvider>
        </AuthProvider>,
        children: [
            {
                path: 'feed',
                element: <FeedPage />
            },
            {
                path: 'users/:id',
                element: <UserByIdPage />,
                children: [
                    {
                        path: "posts",
                        element: <TabPosts />
                    },
                    {
                        path: "followers",
                        element: <TabFollowers />
                    },
                    {
                        path: "following",
                        element: <TabFollowing />
                    },
                    {
                        index: true,
                        element: <Navigate to="posts" replace />,
                    },
                ],
            },
            {
                path: 'users',
                element: <UsersPage />
            },
            {
                path: 'followers',
                element: <FollowersPage />
            },
            {
                path: 'followings',
                element: <FollowingsPage />
            },
            {
                path: 'notifications',
                element: <NotificationsPage />
            },
            {
                path: 'messenger',
                element: <MessengerPage />
            },
            {
                path: 'messenger/:id',
                element: <ChatByIdPage />
            },
            {
                index: true,
                element: <Navigate to="feed" replace />,
            },
        ]
    }
])

dayjs.extend(customParseFormat)

window.addEventListener('vite:preloadError', (event) => {
    console.log('ERROR VITE', event)
    window.location.reload() // for example, refresh the page
})

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <DatesProvider settings={{ locale: 'ru' }}>
            <Notifications />
            <RouterProvider router={routes} />
        </DatesProvider>
      </MantineProvider>
    </Provider>
)
