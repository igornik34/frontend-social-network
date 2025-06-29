import {useForm, yupResolver} from "@mantine/form";
import {LoginRequest} from "../../types/requests/LoginRequest.ts";
import {useLoginMutation} from "../../services/api.ts";
import {Button, LoadingOverlay, PasswordInput, Stack, TextInput} from "@mantine/core";
import {validationSchema} from "./validationSchema.ts";
import {useNavigate} from "react-router-dom";

export function LoginForm() {
    const navigate = useNavigate()
    const form = useForm<LoginRequest>({
        initialValues: {
            email: '',
            password: ''
        },
        validate: yupResolver(validationSchema)
    })
    const [login, {isLoading}] = useLoginMutation()
    const handleSubmit = (values: LoginRequest) => {
        login(values)
            .unwrap()
            .then(() => navigate('/'))
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Stack>
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
                <Button type={'submit'}>Войти</Button>
            </Stack>
        </form>
    )
}