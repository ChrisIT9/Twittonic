import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TweetLikeResponse, TweetResponse, TweetsResponse } from '../typings/Tweets';
import {  TwitterOAuthResponse } from '../typings/TwitterOAuthRequest';
import { UserResponse } from '../typings/TwitterUsers';
import { IndexedDBService } from './indexed-db.service';


@Injectable({
  providedIn: 'root'
})
export class TwitterService {

  jsonHeader = { "Content-Type": "application/json" };
  urlEncodedHeader = { "Content-Type": "application/x-www-form-urlencoded" }

  constructor(private httpClient: HttpClient, private indexedDB: IndexedDBService) { }

  async getTokens(code: string) {
    const challenge = (await this.indexedDB.popFile({ path: `${environment.tempStoragePath}/challenge` })).data;

    const body = new HttpParams()
    .set("code", code)
    .set("client_id", environment.twitterClientId)
    .set("redirect_uri", environment.successRedirectUri)
    .set("code_verifier", challenge)
    .set("grant_type", "authorization_code");

    return this.httpClient.post<TwitterOAuthResponse>(
      `${environment.reverseProxyUrl}/${environment.twitterEndpoint}/oauth2/token`, 
      body.toString(),
      {
        headers: this.urlEncodedHeader
      }
    );
  }

  async refreshTokens() {
    const refreshToken = (await this.indexedDB.readFile({ path: "twittonic/refreshToken" })).data;
    if (!refreshToken) return;

    const body = new HttpParams()
    .set("client_id", environment.twitterClientId)
    .set("grant_type", "refresh_token")
    .set("refresh_token", refreshToken);

    return this.httpClient.post<TwitterOAuthResponse>(
      `${environment.reverseProxyUrl}/${environment.twitterEndpoint}/oauth2/token`, 
      body.toString(),
      {
        headers: this.urlEncodedHeader
      }
    );
  }

  async saveTokens({ access_token, refresh_token, expires_in }: TwitterOAuthResponse) {
    await this.indexedDB.writeFile({ path: "twittonic/accessToken", data: access_token });
    await this.indexedDB.writeFile({ path: "twittonic/refreshToken", data: refresh_token });
    await this.indexedDB.writeFile({ path: "twittonic/expiresIn", data: String(expires_in) });
    await this.indexedDB.writeFile({ path: "twittonic/createdAt", data: String(Math.round(Date.now() / 1000)) });
  }

  getMe() {
    const userFields = "created_at,description,id,location,name,profile_image_url,protected,public_metrics,url,username,verified,withheld";
    return this.httpClient.get<UserResponse>(`${environment.reverseProxyUrl}/${environment.twitterEndpoint}/users/me?user.fields=${userFields}`);
  }

  postTweet(tweet: { text: string }) {
    return this.httpClient.post(
      `${environment.reverseProxyUrl}/${environment.twitterEndpoint}/tweets`, 
      JSON.stringify(tweet),
      {
        headers: this.jsonHeader
      }
    );
  }

  getTweets(userId: number | string, paginationToken?: string) {
    const expansions = "in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id,author_id,attachments.media_keys";
    const mediaFields = "duration_ms,preview_image_url,type,url";
    const tweetFields = "attachments,author_id,conversation_id,created_at,id,in_reply_to_user_id,referenced_tweets,reply_settings,source,text,public_metrics,entities";
    const userFields = "id,name,profile_image_url,username,verified";
    const maxResults = 5;
    return this.httpClient.get<TweetsResponse>(
      `${environment.reverseProxyUrl}/${environment.twitterEndpoint}/users/${userId}/tweets?expansions=${expansions}&media.fields=${mediaFields}&tweet.fields=${tweetFields}&user.fields=${userFields}&max_results=${maxResults}${paginationToken ? `&pagination_token=${paginationToken}`: ""}`
    );
  }

  getTweetById(tweetId: number | string) {
    const expansions = "in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id,author_id,attachments.media_keys";
    const mediaFields = "duration_ms,preview_image_url,type,url";
    const tweetFields = "attachments,author_id,conversation_id,created_at,id,in_reply_to_user_id,referenced_tweets,reply_settings,source,text,public_metrics,entities";
    const userFields = "id,name,profile_image_url,username,verified";
    return this.httpClient.get<TweetResponse>(`${environment.reverseProxyUrl}/${environment.twitterEndpoint}/tweets/${tweetId}?expansions=${expansions}&media.fields=${mediaFields}&tweet.fields=${tweetFields}&user.fields=${userFields}`);
  }

  async revokeTokens() {
    const accessToken = (await this.indexedDB.readFile({ path: "twittonic/accessToken" })).data;
    const refreshToken = (await this.indexedDB.readFile({ path: "twittonic/refreshToken" })).data;
    
    return [{ token: accessToken, type: "access_token" }, { token: refreshToken, type: "refresh_token" }].
    reduce((acc, { token, type }) => {
      if (!token) return acc;

      const body = new HttpParams()
      .set("token", token)
      .set("client_id", environment.twitterClientId)
      .set("token_type_hint", type);

      return [...acc, this.httpClient.post(
        `${environment.reverseProxyUrl}/${environment.twitterEndpoint}/oauth2/revoke`, 
        body.toString(),
        {
          headers: this.urlEncodedHeader
        }
      )];
    }, [] as Observable<Object>[])
  }

  getTweetsLikedByUser(userId: number | string, paginationToken?: string) {
    return this.httpClient.get<Pick<TweetsResponse, 'data' | 'meta'>>(`${environment.reverseProxyUrl}/${environment.twitterEndpoint}/users/${userId}/liked_tweets${paginationToken ? `?pagination_token=${paginationToken}` : ''}`);
  }

  likeTweet(userId: number | string, tweetId: string | number) {
    return this.httpClient.post<TweetLikeResponse>(`
      ${environment.reverseProxyUrl}/${environment.twitterEndpoint}/users/${userId}/likes`, 
      { tweet_id: tweetId },
      {
        headers: this.jsonHeader
      }
    )
  }

  unlikeTweet(userId: number | string, tweetId: string | number) {
    return this.httpClient.delete<TweetLikeResponse>(`
      ${environment.reverseProxyUrl}/${environment.twitterEndpoint}/users/${userId}/likes/${tweetId}`, 
      {
        headers: this.jsonHeader
      }
    )
  }

  retweetTweet(userId: string | number, tweetId: string | number) {
    return this.httpClient.post(`${environment.reverseProxyUrl}/${environment.twitterEndpoint}/users/${userId}/retweets`, { tweet_id: tweetId }, {
      headers: this.jsonHeader
    })
  }

  quoteTweet(tweetId: string | number, tweetContent: string) {
    return this.httpClient.post(`${environment.reverseProxyUrl}/${environment.twitterEndpoint}/tweets`, { text: tweetContent, quote_tweet_id: tweetId }, {
      headers: this.jsonHeader
    })
  }

  deleteRetweet(userId: string | number, tweetId: string | number) {
    return this.httpClient.delete(`${environment.reverseProxyUrl}/${environment.twitterEndpoint}/users/${userId}/retweets/${tweetId}`, {
      headers: this.jsonHeader
    })
  }

  replyToTweet(tweetId: string | number, tweetContent: string) {
    return this.httpClient.post(`${environment.reverseProxyUrl}/${environment.twitterEndpoint}/tweets`, { text: tweetContent, reply: { in_reply_to_tweet_id: tweetId } }, {
      headers: this.jsonHeader
    })
  }
}
