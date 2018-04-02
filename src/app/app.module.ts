import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { WellLogComponent } from './welllog/welllog.component';

// Application config
import { AppConfig } from './app.config';
import { APP_TOKENS, AppTokens } from './app.tokens';

import { RequestService } from './services/index';
import { CurveService } from './services/index';
import { TemplateService } from './services/index';

export function AppConfigFactory() {
  return AppConfig.getInstance(AppTokens.configFile);
};

@NgModule({
  declarations: [
    AppComponent,
    WellLogComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [
    { provide: APP_TOKENS, useValue: AppTokens },
    { provide: AppConfig, useFactory: AppConfigFactory, multi: false },
    RequestService,
    CurveService,
    TemplateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
