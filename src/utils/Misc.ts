import { HTMLObject } from "src/app/typings/HTMLObject";
import { ExpandedTweet, TweetsResponse } from "src/app/typings/Tweets";

export const getExpandedTweets = (tweetsResponse: TweetsResponse): ExpandedTweet[] => {
    return tweetsResponse.data.map(tweet => {
        const htmlObjects: HTMLObject[] = tweet.text.split(" ").map(word => {
            if (word.startsWith("#")) 
                return { content: word, routerLink: `/browse/hashtag/${word.substring(1)}`, transform: true }

            if (word.startsWith("@")) 
                return { content: word, routerLink: `/browse/profile/${word.substring(1)}`, transform: true }
            
            return { content: word, transform: false };
        });

        const { username, name, profile_image_url } = tweetsResponse.includes.users.find(user => user.id === tweet.author_id);
        return { ...tweet, htmlObjects, username, name, profile_image_url }
    });
}