import * as Yup from 'yup'

export const validationSchema = Yup.object({
    firstName: Yup.string().required('Поле обязательно'),
    lastName: Yup.string().required('Поле обязательно'),
    email: Yup.string().email('Некорректный email').required('Поле обязательно'),
    password: Yup.string().min(6).required('Поле обязательно')
})