import { Inject, Injectable } from '@angular/core';
import { Http, RequestOptions, Response } from '@angular/http';
import { RequestService } from './request.service';
import { AppConfig } from '../app.config';

@Injectable()
export class TemplateService {
    constructor(private http: Http, @Inject(AppConfig) private config: AppConfig, private requestService: RequestService) { }
    public async getTemplate(file: string) {
        const url = this.config.get('apiEndpoint') + '/api/v1/templates/' + file;
        const response = await this.http.get(url, this.getOptions()).toPromise();
        return response.json();
    }
    // private helper methods
    private getOptions() {
        return new RequestOptions({ headers: this.requestService.getJsonHeaders() });
    }
}
