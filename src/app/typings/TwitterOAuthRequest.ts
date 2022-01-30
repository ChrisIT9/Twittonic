export interface TwitterOAuthRequestBody {
    code: string,
    code_verifier: string
}

export interface TwitterOAuthResponse {
    token_type: string,
    expires_in: number,
    access_token: string,
    scope: string,
    refresh_token: string
}