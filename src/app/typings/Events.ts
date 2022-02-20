import { TweetComponent } from "../components/tweet/tweet.component";
import { Tweet } from "./Tweets";
import { User } from "./TwitterUsers";

export interface AuthEvent {
    type?: "login" | "logout" | "session" | "firstLogin" | "clientLogin",
    message?: string
    success?: boolean,
    userId?: string,
    likedTweets?: Partial<Tweet>[],
    retweets?: Partial<Tweet>[],
    userInfo?: User,
}

export interface TokenEvent {
    type?: "expired" | "refreshed",
    message?: string,
    success?: boolean
}

export interface TweetEvent {
    type?: "like" | "unlike" | "retweet" | "unretweet" | "quote" | "unquote" | "reply",
    done?: boolean,
    tweetId?: string,
    activatedTweet?: TweetComponent,
    update?: boolean
}