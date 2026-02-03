import axios, { type AxiosInstance } from "axios"
import { config } from "../config/environments"
import { decryptData } from "../utils/crypto"
import { sessionManager } from "./session"


export const api: AxiosInstance = axios.create({ baseURL: config.API_BASE_URL, timeout: 30000, })

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')

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
        const originalRequest = error.config

        // Handle 401 Unauthorized - Session expired
        if (error.response?.status === 401 && !originalRequest.url?.includes("/auth/login")) {
            sessionManager.setExpired()
        }

        return Promise.reject(error)
    },
)
