import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { from, Observable, EMPTY } from 'rxjs';
import { IndexedDBService } from './indexed-db.service';
import { environment } from 'src/environments/environment';
import { TwitterService } from './twitter.service';
import { EventsBroadcasterService } from './events-broadcaster.service';

@Injectable({
  providedIn: 'root'
})
export class RequestInterceptorService implements HttpInterceptor {

  bearerRoutes = ['/users', '/tweets'];
  basicRoutes = ['/oauth2'];
  tokensAreRefreshing = false;

  constructor(private indexedDB: IndexedDBService, private twitterService: TwitterService, private eventsBroadcaster: EventsBroadcasterService) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handle(req, next));
  }

  
  async handle(req: HttpRequest<any>, next: HttpHandler) {
    const createdAt = Number((await this.indexedDB.readFile({ path: "twittonic/createdAt" })).data);
    const expiresIn = Number((await this.indexedDB.readFile({ path: "twittonic/expiresIn" })).data);
    const currentTime = Math.round(Date.now() / 1000);

    const lowerCaseUrl = req.url.toLowerCase();

    if (currentTime > createdAt + expiresIn) {
      console.warn("Tokens have expired, deleting...");
      this.eventsBroadcaster.newTokenEvent({ type: "expired", message: "Tokens have expired!" });
      await this.indexedDB.deleteMultiple("twittonic/accessToken", "twittonic/refreshToken", "twittonic/expiresIn", "twittonic/createdAt");
      //await this.indexedDB.writeFile({ path: "twittonic/logs", data: `[${Date.now().toLocaleString()}] Deleted expired tokens.` });
      return EMPTY.toPromise();
    }

    if (this.basicRoutes.some(item => lowerCaseUrl.includes(item.toLowerCase()))) {
      const base64AuthString = btoa(`${environment.twitterClientId}:${environment.twitterClientSecret}`);
      const authReq = req.clone({
        setHeaders: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${base64AuthString}`
        }
      })
      return next.handle(authReq).toPromise();
    }

    if (this.bearerRoutes.some(item => lowerCaseUrl.includes(item.toLowerCase()) && createdAt)) {
      // request to routes requiring bearer authorization
      if (currentTime > createdAt + expiresIn - 1800 && !this.tokensAreRefreshing) { // Refresh tokens if they're about to expire
        console.log("Tokens are about to expire, refreshing...");
        this.tokensAreRefreshing = true;

        (await this.twitterService.refreshTokens())
          .subscribe(async res => {
            await this.twitterService.saveTokens(res);
            this.tokensAreRefreshing = false;
            this.eventsBroadcaster.newTokenEvent({ type: "refreshed", success: true, message: "Tokens have been refreshed!" });
          })
      }
      const accessToken = (await this.indexedDB.readFile({ path: "twittonic/accessToken" })).data;

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return next.handle(authReq).toPromise();
    }

    return next.handle(req).toPromise();
  }
}
