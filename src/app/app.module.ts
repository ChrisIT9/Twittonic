import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TwitterAuthHandlerComponent } from './twitter-auth-handler/twitter-auth-handler.component';
import { RequestInterceptorService } from './services/request-interceptor.service';
import { FormattedDatePipe } from './pipes/formatted-date.pipe';
import { GetHqPicturePipe } from './pipes/get-hq-picture.pipe';

@NgModule({
  declarations: [AppComponent, TwitterAuthHandlerComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
