import { TwitterService } from "src/app/services/twitter.service";
import { HTMLObject } from "src/app/typings/HTMLObject";
import { ExpandedTweet, Includes, Tweet, TweetsResponse, User } from "src/app/typings/Tweets";

const getOriginalTweetId = (tweet: Tweet, includes: Includes): { source: string, target?: string } => {
    if (!tweet.referenced_tweets) return { source: tweet.id, target: undefined };
    const includedTweet = includes.tweets.find(tweetItem => tweetItem.id === tweet.referenced_tweets[0].id);
    if (!includedTweet) return { source: tweet.id, target: tweet.referenced_tweets[0].id };
    return getOriginalTweetId(includedTweet, includes);
}

export const getExpandedTweets = async (tweetsResponse: TweetsResponse, twitterService: TwitterService): Promise<ExpandedTweet[]> => {
    return Promise.all(tweetsResponse.data.map(async tweet => {
        let retweetedTweet: Tweet | undefined = undefined;
        let mediaUrl: { url: string, type: string }[] | undefined = undefined;
        let quotedUser: User | undefined = undefined;

        if (tweet.referenced_tweets) {
            if (tweet.referenced_tweets[0].type === "retweeted" || tweet.referenced_tweets[0].type === "quoted") {
                const { source, target } = getOriginalTweetId(tweet, tweetsResponse.includes);
                if (source && !target) {
                    const referencedTweetResponse = await twitterService.getTweetById(source).toPromise();
                    retweetedTweet = referencedTweetResponse.data;
                    quotedUser = referencedTweetResponse.includes.users.find(item => item.id === retweetedTweet.author_id);
                    if (referencedTweetResponse.data.attachments?.media_keys?.length > 0) {
                        mediaUrl = retweetedTweet.attachments.media_keys.reduce((acc, mediaKey) => {
                            const { url, type } = referencedTweetResponse.includes.media.find(item => item.media_key === mediaKey);
                            if (url) acc.push({ url, type });
                            return acc; 
                        }, [] as { url: string, type: string }[])
                    }
                } else if (source && target) {
                    const referencedTweetResponse = await twitterService.getTweetById(target).toPromise();
                    const quotedTweet = tweetsResponse.includes.tweets.find(tweet => tweet.id === source);
                    quotedUser = tweetsResponse.includes.users.find(user => user.id === quotedTweet.author_id);
                    retweetedTweet = tweetsResponse.includes.tweets.find(tweetItem => tweetItem.id === source);
                    if (referencedTweetResponse.data.attachments?.media_keys?.length > 0) {
                        mediaUrl = referencedTweetResponse.data.attachments.media_keys.reduce((acc, item) => {
                            const { url, type } = referencedTweetResponse.includes.media.find(media => media.media_key === item);
                            if (url) acc.push({ url, type });
                            return acc;
                        }, [] as { url: string, type: string }[])
                    }
                }
            }
        }

        const retweetHtmlObjects: HTMLObject[] = retweetedTweet?.text.split(" ").map(word => {
            if (word.startsWith("#")) 
                return { content: word, routerLink: `/browse/hashtag/${word.substring(1)}`, transform: true }

            if (word.startsWith("@")) 
                return { content: word, routerLink: `/browse/profile/${word.substring(1)}`, transform: true }

            if (word.startsWith("http"))
                return { content: word, href: word, transform: true }
            
            return { content: word, transform: false };
        });

        let sourceHtmlObjects: HTMLObject[] | undefined;

        if (!tweet.referenced_tweets || (tweet.referenced_tweets && tweet.referenced_tweets[0].type !== "retweeted")) {
            sourceHtmlObjects = tweet?.text.split(" ").map(word => {
                if (word.startsWith("#")) 
                    return { content: word, routerLink: `/browse/hashtag/${word.substring(1)}`, transform: true }
    
                if (word.startsWith("@")) 
                    return { content: word, routerLink: `/browse/profile/${word.substring(1)}`, transform: true }
    
                if (word.startsWith("http"))
                    return { content: word, href: word, transform: true }
                
                return { content: word, transform: false };
            });
        }


        const { username, name, profile_image_url } = tweetsResponse.includes.users.find(user => user.id === tweet.author_id);
        return { ...tweet, retweetHtmlObjects, sourceHtmlObjects, username, name, profile_image_url, mediaUrl, retweetedTweet, quotedUser };
    }));
}