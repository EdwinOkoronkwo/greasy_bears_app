import { enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideEnvironmentNgxMask, provideNgxMask, IConfig } from 'ngx-mask';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  //TokenInterceptorService,
  authInterceptor,
} from './app/services/token-interceptor/token-interceptor.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

if (environment.production) {
  enableProdMode();
}

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNgxMask(),
    importProvidersFrom(BrowserAnimationsModule),
  ],
});
