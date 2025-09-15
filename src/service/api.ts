import axios, { type AxiosInstance } from "axios"
import { config } from "../config/environments"
import { decryptData } from "../utils/crypto"


export const api: AxiosInstance = axios.create({ baseURL: config.API_BASE_URL, timeout: 30000, })

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        if (token && !config.url?.includes("/auth/login")) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
        //     config.data = {
        //         encryptedData: encryptData(config.data),
        //     }
        // }

        return config
    },
    (error) => Promise.reject(error),
)

api.interceptors.response.use(
    (response) => {

        if (response.data?.encryptedData) {
            response.data = decryptData(response.data.encryptedData)
        }
        return response
    },
    async (error) => {
        // const originalRequest = error.config

        // if (error.response?.status === 401 && !originalRequest._retry) {
        //     originalRequest._retry = true

        //     try {
        //         const token = localStorage.getItem('token')
        //         originalRequest.headers.Authorization = `Bearer ${token}`
        //         return api(originalRequest)
        //     } catch (refreshError) {
        //         return Promise.reject(refreshError)
        //     }
        // }

        return Promise.reject(error)
    },
)


