import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router'; // <-- ADDED THIS
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // <-- TURN ON THE MAGIC ENGINE HERE
    provideRouter(routes, withViewTransitions()),
    provideHttpClient()
  ]
};
