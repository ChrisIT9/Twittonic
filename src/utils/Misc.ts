import { TwitterService } from "src/app/services/twitter.service";
import { HTMLObject } from "src/app/typings/HTMLObject";
import { ExpandedTweet, Tweet, TweetsResponse } from "src/app/typings/Tweets";

export const getExpandedTweets = async (tweetsResponse: TweetsResponse, twitterService: TwitterService): Promise<ExpandedTweet[]> => {
    return Promise.all(tweetsResponse.data.map(async tweet => {
        let retweetedTweet: Tweet | undefined = undefined;
        let mediaUrl: string[] | undefined = undefined;

        if (tweet.referenced_tweets) {
            if (tweet.referenced_tweets[0].type === "retweeted") {
                const referencedTweetId = tweet.referenced_tweets[0].id;
                const foundTweet = tweetsResponse.includes.tweets.find(item => item.id === referencedTweetId);
                if (foundTweet?.attachments?.media_keys?.length > 0) {
                    const referencedTweetResponse = await twitterService.getTweetById(referencedTweetId).toPromise();
                    retweetedTweet = referencedTweetResponse.data;
                    mediaUrl = retweetedTweet.attachments.media_keys.reduce((acc, mediaKey) => {
                        const { url } = referencedTweetResponse.includes.media.find(item => item.media_key === mediaKey);
                        if (url) acc.push(url);
                        return acc; 
                    }, [] as string[])
                }
            }
        }

        const htmlObjects: HTMLObject[] = (retweetedTweet || tweet).text.split(" ").map(word => {
            if (word.startsWith("#")) 
                return { content: word, routerLink: `/browse/hashtag/${word.substring(1)}`, transform: true }

            if (word.startsWith("@")) 
                return { content: word, routerLink: `/browse/profile/${word.substring(1)}`, transform: true }

            if (word.startsWith("http"))
                return { content: word, href: word, transform: true }
            
            return { content: word, transform: false };
        });

        const { username, name, profile_image_url } = tweetsResponse.includes.users.find(user => user.id === tweet.author_id);
        return { ...tweet, htmlObjects, username, name, profile_image_url, mediaUrl, retweetedTweet };
    }));
}