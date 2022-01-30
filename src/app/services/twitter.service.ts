import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {  TwitterOAuthResponse } from '../typings/TwitterOAuthRequest';
import { IndexedDBService } from './indexed-db.service';


@Injectable({
  providedIn: 'root'
})
export class TwitterService {

  constructor(private httpClient: HttpClient, private indexedDB: IndexedDBService) { }

  async getTokens(code: string) {
    const base64AuthString = btoa(`${environment.twitterClientId}:${environment.twitterClientSecret}`);
    const challenge = (await this.indexedDB.popFile({ path: `${environment.tempStoragePath}/challenge` })).data;

    const parsedBody = new HttpParams()
    .set("code", code)
    .set("client_id", environment.twitterClientId)
    .set("redirect_uri", environment.successRedirectUri)
    .set("code_verifier", challenge)
    .set("grant_type", "authorization_code");

    return this.httpClient.post<TwitterOAuthResponse>(`${environment.backendEndpoint}/oauth2/token`, parsedBody.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${base64AuthString}`
      }
    })
  }

  getTimeline(authToken: string) {
    return this.httpClient.get(`${environment.backendEndpoint}/timeline`, {
      headers: {
        authToken
      }
    })
  }
}
