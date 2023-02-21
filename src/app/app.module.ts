/** Angular */
import { NgModule, isDevMode, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

/** 3rd party modules */
import { HotToastModule } from '@ngneat/hot-toast';

/** Core */
import { ApiModule } from '@api';
import { CoreModule } from '@core';
import { ServicesModule } from '@services';
import { initializeApp } from '@configs';

/** App */
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    /** Angular */
    BrowserModule,
    BrowserAnimationsModule,

    /** Core */
    ApiModule,
    CoreModule,
    ServicesModule,

    /** App */
    AppRoutingModule,

    /** 3rd party modules */
    HotToastModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
