import { TwitterService } from "src/app/services/twitter.service";
import { HTMLObject } from "src/app/typings/HTMLObject";
import { ExpandedTweet, Includes, Tweet, TweetsResponse, Url, User } from "src/app/typings/Tweets";

export const getOriginalTweetId = (tweet: Tweet, includes: Includes): { source: string, target?: string } => {
    if (!tweet.referenced_tweets) return { source: tweet.id, target: undefined };
    const includedTweet = includes.tweets.find(tweetItem => tweetItem.id === tweet.referenced_tweets[0].id);
    if (!includedTweet) return { source: tweet.id, target: tweet.referenced_tweets[0].id };
    return getOriginalTweetId(includedTweet, includes);
}

export const getExpandedTweets = async (tweetsResponse: TweetsResponse, twitterService: TwitterService): Promise<ExpandedTweet[]> | undefined => {
    if (tweetsResponse.meta.result_count === 0) return undefined;

    return Promise.all(tweetsResponse?.data?.map(async tweet => {
        let retweetedTweet: Tweet | undefined = undefined;
        let mediaUrl: { url: string, type: string }[] | undefined = undefined;
        let quotedUser: User | undefined = undefined;
        let intermediaryTweet: Tweet | undefined = undefined;

        const originalUser = tweetsResponse.includes.users.find(user => user.id === tweet.author_id);

        if (!tweet.referenced_tweets && tweet.attachments?.media_keys) {
            mediaUrl = tweet.attachments.media_keys.reduce((acc, mediaKey) => {
                const media = tweetsResponse.includes?.media?.find(item => item.media_key === mediaKey);
                if (media) acc.push({ url: media.url, type: media.type });
                return acc;
            }, [] as { url: string, type: string }[])
        }

        if (tweet.referenced_tweets) {
            const intermediaryTweetId = tweet.referenced_tweets[0].id;
            const intermediaryTweetResponse = await twitterService.getTweetById(intermediaryTweetId).toPromise();

            if (intermediaryTweetResponse.error || intermediaryTweetResponse.errors) return undefined;

            if (!intermediaryTweetResponse.data?.referenced_tweets || (intermediaryTweetResponse.data?.referenced_tweets && intermediaryTweetResponse.data?.referenced_tweets[0].type !== "retweeted")) {
                mediaUrl = intermediaryTweetResponse.data?.attachments?.media_keys?.reduce((acc, mediaKey) => {
                    const { url, type } = intermediaryTweetResponse.includes.media.find(item => item.media_key === mediaKey);
                    if (url) acc.push({ url, type });
                    return acc;
                }, [] as { url: string, type: string }[]);
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
                        }, [] as { url: string, type: string }[]);
                    }
                }
            }
        }

        const retweetHtmlObjects: HTMLObject[] = retweetedTweet?.text?.replaceAll("\n", " <br> ").split(" ").map(word => {
            if (word.startsWith("#")) {
                const foundHashtag = tweet.entities?.hashtags?.find(item => word.toLowerCase().includes(item.tag.toLowerCase()))
                return { content: `${word} `, routerLink: `/browse`, queryParams: { hashtag: `${foundHashtag?.tag || word.substring(1)}`, search: null }, transform: true }
            }

            if (word.startsWith("@")) {
                const foundUsername = tweet.entities?.mentions?.find(item => word.toLowerCase().includes(item.username.toLowerCase()));
                if (foundUsername) return { content: `${word} `, href: `https://www.twitter.com/${foundUsername.username}`, transform: true };
                else return { content: `${word} `, transform: false }
            }
                

            if (word.startsWith("http")) {
                let foundUrl: Url;
                foundUrl = tweet.entities?.urls?.find(item => word.toLowerCase().includes(item.url.toLowerCase()));
                if (!foundUrl) {
                    [ foundUrl ] = tweetsResponse.includes?.tweets
                    ?.map(item => item.entities?.urls?.find(urlItem => word.toLowerCase().includes(urlItem.url.toLowerCase())))
                    .filter(item => item);
                }
                if (foundUrl?.expanded_url?.indexOf("twitter") !== -1) return undefined;
                return { content: `${foundUrl?.display_url || word} `, href: foundUrl?.expanded_url || word, transform: true }
            }
                
            return { content: `${word} `, transform: false };
        });

        let sourceHtmlObjects: HTMLObject[] | undefined;

        if (!tweet.referenced_tweets || (tweet.referenced_tweets && tweet.referenced_tweets[0].type !== "retweeted")) {
            sourceHtmlObjects = tweet?.text.replaceAll("\n", " <br> ").split(" ").map(word => {
                if (word.startsWith("#")) {
                    const foundHashtag = tweet.entities?.hashtags?.find(item => word.toLowerCase().includes(item.tag.toLowerCase()))
                    return { content: `${word} `, routerLink: `/browse`, queryParams: { hashtag: `${foundHashtag?.tag || word.substring(1)}`, search: null }, transform: true }
                }
    
                if (word.startsWith("@")) {
                    const foundUsername = tweet.entities?.mentions?.find(item => word.toLowerCase().includes(item.username.toLowerCase()));
                    if (foundUsername) return { content: `${word} `, href: `https://www.twitter.com/${foundUsername.username}`, transform: true };
                    else return { content: `${word} `, transform: false };
                }
    
                if (word.startsWith("http")) {
                    let foundUrl: Url;
                    foundUrl = tweet.entities?.urls?.find(item => word.toLowerCase().includes(item.url.toLowerCase()));
                    if (!foundUrl) {
                        [ foundUrl ] = tweetsResponse.includes?.tweets
                        ?.map(item => item.entities?.urls?.find(urlItem => word.toLowerCase().includes(urlItem.url.toLowerCase())))
                        .filter(item => item);
                    }
                    if (foundUrl?.expanded_url.indexOf("twitter") !== -1) return undefined;
                    return { content: `${foundUrl?.display_url || word} `, href: foundUrl?.expanded_url || word, transform: true }
                }

                
                return { content: `${word} `, transform: false };
            });
        }


        const { username, name, profile_image_url } = tweetsResponse.includes.users.find(user => user.id === tweet.author_id);
        return { ...tweet, verified: originalUser.verified, retweetHtmlObjects, sourceHtmlObjects, username, name, profile_image_url, mediaUrl, retweetedTweet, quotedUser, intermediaryTweet };
    }));
}