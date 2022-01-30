export interface User {
    id: string,
    name: string,
    username: string
}

export interface MetaInfo {
    result_count: 100, next_token: string
}

export interface UserResponse {
    data: User,
    meta: MetaInfo
}

export interface Followings {
    data: User[],
    meta: MetaInfo
}