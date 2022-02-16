import { TweetComponent } from "../components/tweet/tweet.component";
import { Tweet } from "./Tweets";

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

export interface TweetEvent {
    type: "like" | "unlike" | "retweet" | "quote",
    activatedTweet: TweetComponent
}