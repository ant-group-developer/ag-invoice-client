import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const axiosBase = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosBase.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error) => Promise.reject(error)
);

axiosBase.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.error("❌ Unauthorized (401)");
        }
        return Promise.reject(error);
    }
);

export default axiosBase;