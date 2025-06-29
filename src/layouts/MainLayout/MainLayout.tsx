import {AppShell, Text, Burger, Group, BackgroundImage, Highlight, Container} from '@mantine/core';
import {Navigate, Outlet} from "react-router-dom";
import {AuthRouter} from "../../modules/auth/routes.ts";
import {useAuth} from "../../modules/auth/context/AuthContext.tsx";
import {useDisclosure} from "@mantine/hooks";
import {Navbar} from "../../modules/navigation/components/Navbar/Navbar.tsx";

export function MainLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

    const { authData } = useAuth() // Получаем данные авторизации

    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!authData) {
        return <Navigate to={AuthRouter.routes.login} replace />
    }

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }, }}
            padding="md"
            styles={{
                main: {
                    backgroundImage: 'url(/chat-backgrounds/pattern-31.svg)',
                    backgroundSize: 'cover',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center',
                }
            }}
        >
            <AppShell.Header>
                <Group h="100%" px="md" wrap={'nowrap'}>
                    <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                    <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
                    <Highlight
                        highlight={'Quick Talk'}
                        highlightStyles={{
                            backgroundImage:
                                'linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))',
                            fontWeight: 700,
                            fontSize: '24px',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Quick Talk
                    </Highlight>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar>
                <Navbar mobileOpened={mobileOpened} onCloseMobile={toggleMobile}/>
            </AppShell.Navbar>
            <AppShell.Main>
                <Container>
                    <Outlet />
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}