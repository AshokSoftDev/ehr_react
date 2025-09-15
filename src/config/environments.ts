export const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || "",
    WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8000/socket",
    PRODUCTION: import.meta.env.VITE_PRODUCTION || false,
}
