import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// const auth0Client = new Auth0Client(auth0Config);

const axiosBase = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosBase.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // const token = await auth0Client.getTokenSilently();
            // config.headers.set("Authorization", `Bearer ${token}`);
        } catch (error) {
            console.warn("⚠️ Cannot get access token", error);
        }

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