export interface AuthEvent {
    type?: "login" | "logout" | "session",
    message?: string
    success?: boolean
}

export interface TokenEvent {
    type?: "expired" | "refreshed",
    message?: string,
    success?: boolean
}