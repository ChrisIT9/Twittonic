import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TweetsResponse } from '../typings/Tweets';
import {  TwitterOAuthResponse } from '../typings/TwitterOAuthRequest';
import { UserResponse } from '../typings/TwitterUsers';
import { IndexedDBService } from './indexed-db.service';


@Injectable({
  providedIn: 'root'
})
export class TwitterService {

  constructor(private httpClient: HttpClient, private indexedDB: IndexedDBService) { }

  async getTokens(code: string) {
    const challenge = (await this.indexedDB.popFile({ path: `${environment.tempStoragePath}/challenge` })).data;

    const body = new HttpParams()
    .set("code", code)
    .set("client_id", environment.twitterClientId)
    .set("redirect_uri", environment.successRedirectUri)
    .set("code_verifier", challenge)
    .set("grant_type", "authorization_code");

    return this.httpClient.post<TwitterOAuthResponse>(`${environment.backendEndpoint}/oauth2/token`, body.toString());
  }

  async refreshTokens() {
    const refreshToken = (await this.indexedDB.readFile({ path: "twittonic/refreshToken" })).data;
    if (!refreshToken) return;

    const body = new HttpParams()
    .set("client_id", environment.twitterClientId)
    .set("grant_type", "refresh_token")
    .set("refresh_token", refreshToken);

    return this.httpClient.post<TwitterOAuthResponse>(`${environment.backendEndpoint}/oauth2/token`, body.toString());
  }

  async saveTokens({ access_token, refresh_token, expires_in }: TwitterOAuthResponse) {
    await this.indexedDB.writeFile({ path: "twittonic/accessToken", data: access_token });
    await this.indexedDB.writeFile({ path: "twittonic/refreshToken", data: refresh_token });
    await this.indexedDB.writeFile({ path: "twittonic/expiresIn", data: String(expires_in) });
    await this.indexedDB.writeFile({ path: "twittonic/createdAt", data: String(Math.round(Date.now() / 1000)) });
  }

  getMe() {
    const userFields = "created_at,description,id,location,name,profile_image_url,protected,public_metrics,url,username,verified,withheld";
    return this.httpClient.get<UserResponse>(`${environment.backendEndpoint}/users/me?user.fields=${userFields}`);
  }

  postTweet(tweet: { text: string }) {
    const body = new HttpParams()
    .set("text", tweet.text);

    return this.httpClient.post(`${environment.backendEndpoint}/tweets`, body.toString());
  }

  getTweets(id: number | string) {
    const expansions = "in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id,author_id";
    const mediaFields = "duration_ms,preview_image_url,type,url";
    const tweetFields = "attachments,author_id,conversation_id,created_at,id,in_reply_to_user_id,referenced_tweets,reply_settings,source,text,public_metrics";
    const userFields = "id,name,profile_image_url,username,verified";
    const maxResults = 50;
    return this.httpClient.get<TweetsResponse>(
      `${environment.backendEndpoint}/users/${id}/tweets?expansions=${expansions}&media.fields=${mediaFields}&tweet.fields=${tweetFields}&user.fields=${userFields}&max_results=${maxResults}`
      );
  }
}
