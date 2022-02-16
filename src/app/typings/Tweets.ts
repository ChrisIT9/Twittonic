import { HTMLObject } from "./HTMLObject";

export interface Media {
    media_key: string,
    url: string,
    type: string
}

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
    referenced_tweets?: {
        type: string,
        id: string
    }[],
    attachments?: {
        media_keys: string[]
    }
}

export interface User {
    username: string;
    verified: boolean;
    name: string;
    id: string;
    profile_image_url: string;
}

export interface Includes {
    users?: User[];
    tweets?: Tweet[],
    media: Media[]
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

export interface TweetResponse {
    data: Tweet;
    includes: Includes;
    errors: Error[];
    meta: Meta;
}

export interface ExpandedTweet extends Tweet {
    name?: string,
    username?: string,
    profile_image_url?: string,
    htmlObjects?: HTMLObject[],
    mediaUrl?: string[],
    retweetedTweet?: Tweet
}

export interface TweetLikeResponse {
    data: { liked: boolean }
}