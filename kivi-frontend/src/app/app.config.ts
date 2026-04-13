import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { lastValueFrom }     from 'rxjs';
import { routes }            from './app.routes';
import { AuthService }       from './core/services/auth.service';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';

function initAuth(auth: AuthService) {
  return () => lastValueFrom(auth.checkSession()).catch(() => null);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([credentialsInterceptor]),
    ),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};