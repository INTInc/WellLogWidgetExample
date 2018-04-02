import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { AppConfig } from './app/app.config';
import { AppTokens } from './app/app.tokens';


AppConfig.loadInstance(AppTokens.configFile)
    .then(() => {
        if (environment.production) {
            enableProdMode();
        }
        platformBrowserDynamic().bootstrapModule(AppModule);
    });


