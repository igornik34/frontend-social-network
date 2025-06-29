import * as Yup from 'yup'

export const validationSchema = Yup.object({
    email: Yup.string().email('Некорректный email').required('Поле обязательно'),
    password: Yup.string().min(6).required('Поле обязательно')
})