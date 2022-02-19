import { TwitterService } from "src/app/services/twitter.service";
import { HTMLObject } from "src/app/typings/HTMLObject";
import { ExpandedTweet, Includes, Tweet, TweetsResponse, Url, User } from "src/app/typings/Tweets";

export const getOriginalTweetId = (tweet: Tweet, includes: Includes): { source: string, target?: string } => {
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
        let intermediaryTweet: Tweet | undefined = undefined;

        if (tweet.referenced_tweets) {
            const intermediaryTweetId = tweet.referenced_tweets[0].id;
            const intermediaryTweetResponse = await twitterService.getTweetById(intermediaryTweetId).toPromise();

            if (!intermediaryTweetResponse.data.referenced_tweets || (intermediaryTweetResponse.data.referenced_tweets && intermediaryTweetResponse.data.referenced_tweets[0].type !== "retweeted")) {
                mediaUrl = intermediaryTweetResponse.data.attachments?.media_keys?.reduce((acc, mediaKey) => {
                    const { url, type } = intermediaryTweetResponse.includes.media.find(item => item.media_key === mediaKey);
                    if (url) acc.push({ url, type });
                    return acc;
                }, [] as { url: string, type: string }[])
                intermediaryTweet = intermediaryTweetResponse.data;
                retweetedTweet = intermediaryTweetResponse.data;
                quotedUser = intermediaryTweetResponse.includes.users.find(item => item.id === intermediaryTweetResponse.data.author_id);
            } else {
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
                } else {
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

        const retweetHtmlObjects: HTMLObject[] = retweetedTweet?.text.replaceAll("\n", "<br> ").split(" ").map(word => {
            if (word.startsWith("#")) 
                return { content: `${word} `, routerLink: `/browse/hashtag/${word.substring(1)}`, transform: true }

            if (word.startsWith("@")) 
                return { content: `${word} `, routerLink: `/browse/profile/${word.substring(1)}`, transform: true }

            if (word.startsWith("http")) {
                let foundUrl: Url;
                foundUrl = tweet.entities?.urls?.find(item => item.url === word);
                if (!foundUrl) {
                    [ foundUrl ] = tweetsResponse.includes?.tweets
                    .map(item => item.entities?.urls?.find(urlItem => urlItem.url === word))
                    .filter(item => item);
                }
                if (foundUrl.expanded_url.indexOf("twitter") !== -1) return undefined;
                return { content: `${foundUrl?.display_url || word} `, href: foundUrl?.expanded_url || word, transform: true }
            }
                
            return { content: `${word} `, transform: false };
        });

        let sourceHtmlObjects: HTMLObject[] | undefined;

        if (!tweet.referenced_tweets || (tweet.referenced_tweets && tweet.referenced_tweets[0].type !== "retweeted")) {
            sourceHtmlObjects = tweet?.text.replaceAll("\n", "<br> ").split(" ").map(word => {

                if (word.startsWith("#")) 
                    return { content: `${word} `, routerLink: `/browse/hashtag/${word.substring(1)}`, transform: true }
    
                if (word.startsWith("@")) 
                    return { content: `${word} `, routerLink: `/browse/profile/${word.substring(1)}`, transform: true }
    
                if (word.startsWith("http")) {
                    let foundUrl: Url;
                    foundUrl = tweet.entities?.urls?.find(item => item.url === word);
                    if (!foundUrl) {
                        [ foundUrl ] = tweetsResponse.includes?.tweets
                        .map(item => item.entities?.urls?.find(urlItem => urlItem.url === word))
                        .filter(item => item);
                    }
                    if (foundUrl.expanded_url.indexOf("twitter") !== -1) return undefined;
                    return { content: `${foundUrl?.display_url || word} `, href: foundUrl?.expanded_url || word, transform: true }
                }

                
                return { content: `${word} `, transform: false };
            });
        }


        const { username, name, profile_image_url } = tweetsResponse.includes.users.find(user => user.id === tweet.author_id);
        return { ...tweet, retweetHtmlObjects, sourceHtmlObjects, username, name, profile_image_url, mediaUrl, retweetedTweet, quotedUser, intermediaryTweet };
    }));
}