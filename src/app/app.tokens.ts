import {InjectionToken} from '@angular/core';

export let APP_TOKENS = new InjectionToken('app.tokens');

export interface IAppTokens {
    configFile: string;
}

export const AppTokens: IAppTokens = {
    configFile: 'assets/config/app.json'
};
