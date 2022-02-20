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

export interface Url {
    start: number;
    end: number;
    url: string;
    expanded_url: string;
    display_url: string;
}

export interface Hashtag {
    start: number,
    end: number,
    tag: string
}

export interface Mention {
    start: number,
    end: number,
    username: string,
    id: string
}

export interface Entities {
    urls?: Url[];
    hashtags?: Hashtag[],
    mentions?: Mention[]
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
    entities?: Entities 
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
    next_token?: string;
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
    error?: any
}

export interface ExpandedTweet extends Tweet {
    name?: string,
    username?: string,
    profile_image_url?: string,
    sourceHtmlObjects?: HTMLObject[],
    retweetHtmlObjects?: HTMLObject[],
    mediaUrl?: { url: string, type: string }[],
    retweetedTweet?: Tweet,
    quotedUser?: User,
    intermediaryTweet?: Tweet,
    verified?: boolean,
}

export interface TweetLikeResponse {
    data: { liked: boolean }
}