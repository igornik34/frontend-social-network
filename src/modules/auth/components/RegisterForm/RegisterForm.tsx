import {useForm, yupResolver} from "@mantine/form";
import {useRegisterMutation} from "../../services/api.ts";
import {Button, Group, LoadingOverlay, PasswordInput, Stack, TextInput} from "@mantine/core";
import {RegisterRequest} from "../../types/requests/RegisterRequest.ts";
import {validationSchema} from "./validationSchema.ts";
import {useNavigate} from "react-router-dom";
import {AuthRouter} from "../../routes.ts";

export function RegisterForm() {
    const navigate = useNavigate()
    const form = useForm<RegisterRequest>({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        },
        validate: yupResolver(validationSchema)
    })
    const [register, {isLoading}] = useRegisterMutation()
    const handleSubmit = (values: RegisterRequest) => {
        register(values)
            .unwrap()
            .then(() => navigate(AuthRouter.routes.login))
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Stack>
                <Group grow={true}>
                    <TextInput
                        label={'Имя'}
                        withAsterisk
                        placeholder={'Введите имя'}
                        key={form.key('firstName')}
                        {...form.getInputProps('firstName')}
                    />
                    <TextInput
                        label={'Фамилия'}
                        withAsterisk
                        placeholder={'Введите фамилию'}
                        key={form.key('lastName')}
                        {...form.getInputProps('lastName')}
                    />
                </Group>
                <TextInput
                    label={'Email'}
                    withAsterisk
                    placeholder={'Введите email'}
                    key={form.key('email')}
                    {...form.getInputProps('email')}
                />
                <PasswordInput
                    label={'Пароль'}
                    withAsterisk
                    placeholder={'Введите пароль'}
                    key={form.key('password')}
                    {...form.getInputProps('password')}
                />
                <Button type={'submit'}>Зарегистрироваться</Button>
            </Stack>
        </form>
    )
}