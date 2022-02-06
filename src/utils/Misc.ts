import { ExpandedTweet, TweetsResponse } from "src/app/typings/Tweets";

export const getExpandedTweets = (tweetsResponse: TweetsResponse): ExpandedTweet[] => {
    return tweetsResponse.data.map(tweet => {
        const { username, name, profile_image_url } = tweetsResponse.includes.users.find(user => user.id === tweet.author_id);
        return { ...tweet, username, name, profile_image_url };
    });
}