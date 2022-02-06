export interface AuthEvent {
    type?: "login" | "logout" | "session",
    message?: string
    success?: boolean
}