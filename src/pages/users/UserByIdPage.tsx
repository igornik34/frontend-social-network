import {Profile} from "../../modules/users/components/Profile/Profile.tsx";
import {Link, Outlet, useLocation, useParams} from "react-router-dom";
import {Container, Paper, Stack, Tabs} from "@mantine/core";

export function UserByIdPage() {
    const { id } = useParams();
    const location = useLocation();

    // Получаем текущую вкладку из URL
    const activeTab = location.pathname.split("/").pop() || "followers";

    return (
        <Container size="lg">
            <Stack>
                <Paper
                    radius="md"
                    shadow="sm"
                >
                    <Profile id={id || ''} />
                </Paper>

                <Tabs
                    value={activeTab}
                    keepMounted={false}
                    variant={'pills'}
                >
                    <Stack>
                        <Paper radius="md" p="xs" withBorder>
                            <Tabs.List grow>
                                <Tabs.Tab
                                    value="posts"
                                    component={Link}
                                    to={`/users/${id}/posts`}
                                >
                                    Посты
                                </Tabs.Tab>
                                <Tabs.Tab
                                    value="followers"
                                    component={Link}
                                    to={`/users/${id}/followers`}
                                >
                                    Подписчики
                                </Tabs.Tab>
                                <Tabs.Tab
                                    value="following"
                                    component={Link}
                                    to={`/users/${id}/following`}
                                >
                                    Подписки
                                </Tabs.Tab>
                            </Tabs.List>
                        </Paper>
                        <Outlet />
                    </Stack>
                </Tabs>
            </Stack>
        </Container>
    );
}