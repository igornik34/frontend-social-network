import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {loadUserState} from "../../modules/auth/slice/AuthSlice.ts";
import {store} from "../../app/store/store.ts";

/**
 * Универсальный HTTP-клиент с автоматической обработкой ошибок.
 */

const customAxios = axios.create();

// Добавляем интерцептор для динамической подстановки токена
customAxios.interceptors.request.use((config) => {
    const token = store.getState().auth?.authData?.accessToken; // Получаем актуальный токен из хранилища
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const httpClient = {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return customAxios.get<T>(url, config).then(unwrapData).catch(handleError);
    },

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        return customAxios.post<T>(url, data, config).then(unwrapData).catch(handleError);
    },

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        return customAxios.put<T>(url, data, config).then(unwrapData).catch(handleError);
    },

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return customAxios.delete<T>(url, config).then(unwrapData).catch(handleError);
    },
};

// Извлекает данные из ответа Axios
const unwrapData = <T>(response: AxiosResponse<T>): T => response.data;

// Обрабатывает ошибки Axios и преобразует в единый формат
const handleError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        const status = error.response?.status;
        throw { message, status }; // Можно заменить на кастомный класс ошибки
    }
    throw error; // Если ошибка не от Axios
};