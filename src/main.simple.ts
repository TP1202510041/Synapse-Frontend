import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponentSimple } from './app/app.component.simple';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponentSimple, appConfig)
  .catch(err => console.error(err));