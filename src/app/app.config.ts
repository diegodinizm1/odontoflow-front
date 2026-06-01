import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideNativeDateAdapter(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-rounded' } },
  ],
};
