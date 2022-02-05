export interface User {
    created_at?: string,
    description?: string,
    id: string,
    location?: string,
    name: string,
    profile_image_url?: string,
    protected?: boolean,
    public_metrics?: {
        followers_count: number,
        following_count: number,
        tweet_count: number,
        listed_count: number
    },
    url?: string,
    username: string,
    verified?: boolean
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