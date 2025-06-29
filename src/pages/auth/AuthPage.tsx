import {Box, Card, Center, Tabs, Text, Image, Stack, Divider, Group, Anchor, BackgroundImage} from "@mantine/core";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthRouter } from "../../modules/auth/routes.ts";
import {CiLock} from "react-icons/ci";
import {FaUserPlus} from "react-icons/fa";

type Tab = 'login' | 'register';

export function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = location.pathname.split('/')[2] as Tab;

    const handleChangeTab = (val: Tab) => {
        navigate(AuthRouter.routes[val]);
    };

    return (
        <Center h={'100vh'}>
            <BackgroundImage
                src={'/chat-backgrounds/pattern-31.svg'}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                }}
            />
            <Card shadow="sm" radius="md" withBorder>
                <Stack align={'center'} mb={'md'}>
                    {/*/!* Логотип *!/*/}
                    {/*<Image*/}
                    {/*    src="/logo.svg"*/}
                    {/*    alt="App Logo"*/}
                    {/*    mb="sm"*/}
                    {/*/>*/}
                    <Text size="xl" fw={700}>
                        Добро пожаловать
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                        {activeTab === 'login'
                            ? 'Войдите в свой аккаунт, чтобы продолжить'
                            : 'Создайте новый аккаунт'}
                    </Text>
                </Stack>

                <Tabs
                    value={activeTab}
                    onChange={handleChangeTab}
                    variant="pills"
                >
                    <Tabs.List grow mb="xl">
                        <Tabs.Tab
                            value="login"
                            leftSection={<CiLock />}
                        >
                            Вход
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="register"
                            leftSection={<FaUserPlus />}
                        >
                            Регистрация
                        </Tabs.Tab>
                    </Tabs.List>

                    <Outlet />
                </Tabs>

                {/*<Divider*/}
                {/*    my="md"*/}
                {/*    label="Или продолжите с"*/}
                {/*    labelPosition="center"*/}
                {/*/>*/}

                {/*/!* Ссылка на условия использования *!/*/}
                {/*<Text size="xs" c="dimmed" ta="center" mt="md">*/}
                {/*    Продолжая, вы соглашаетесь с нашими{' '}*/}
                {/*    <Anchor href="/terms" size="xs">*/}
                {/*        Условиями использования*/}
                {/*    </Anchor>{' '}*/}
                {/*    и{' '}*/}
                {/*    <Anchor href="/privacy" size="xs">*/}
                {/*        Политикой конфиденциальности*/}
                {/*    </Anchor>*/}
                {/*</Text>*/}
            </Card>
        </Center>
    );
}