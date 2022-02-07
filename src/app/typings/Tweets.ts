import { HTMLObject } from "./HTMLObject";

export interface Metrics {
    retweet_count: number,
    reply_count: number,
    like_count: number,
    quote_count: number
}

export interface Tweet {
    public_metrics: Metrics,
    source: string;
    text: string;
    conversation_id: string;
    author_id: string;
    created_at: string;
    id: string;
    reply_settings: string;
    in_reply_to_user_id: string;
}

export interface User {
    username: string;
    verified: boolean;
    name: string;
    id: string;
    profile_image_url: string;
}

export interface Includes {
    users: User[];
}

export interface Error {
    parameter: string;
    resource_id: string;
    value: string;
    detail: string;
    title: string;
    resource_type: string;
    type: string;
}

export interface Meta {
    oldest_id: string;
    newest_id: string;
    result_count: number;
    next_token: string;
}

export interface TweetsResponse {
    data: Tweet[];
    includes: Includes;
    errors: Error[];
    meta: Meta;
}

export interface ExpandedTweet extends Tweet {
    name?: string,
    username?: string,
    profile_image_url?: string,
    htmlObjects?: HTMLObject[]
}