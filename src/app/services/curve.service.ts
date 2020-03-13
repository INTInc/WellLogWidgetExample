import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { RequestService } from './request.service';
import { AppConfig } from '../app.config';
@Injectable()
export class CurveService {
    constructor(private http: HttpClient, @Inject(AppConfig) private config: AppConfig, private requestService: RequestService) { }
    public async getCurveMetaData(curveId: string) {
        const url = this.config.get('apiEndpoint') + '/api/v1/curves/' + curveId;
        const response = await this.http.get(url, this.getHeaders()).toPromise();
        return response;
    }
    public async getCurveRange(curveId: string) {
        const url = this.config.get('apiEndpoint') + '/api/v1/curves/' + curveId + '/range';
        const response = await this.http.get(url, this.getHeaders()).toPromise();
        return response;
    }
    public async getCurvesList() {
        const url = this.config.get('apiEndpoint') + '/api/v1/curves';
        const response = await this.http.get(url, this.getHeaders()).toPromise();
        return response;
    }
    public async getCurvesData(curves, range, scale?, useDecimation?) {
        const url = this.config.get('apiEndpoint') + '/api/v1/curves/data';
        const response = await this.http.post(url, JSON.stringify({
            'curves': curves,
            'range': {
                'min': range.getLow(),
                'max': range.getHigh()
            },
            'scale': scale,
            'usedecimation': useDecimation
        }), this.getHeaders()).toPromise();
        return response;
    }
    // private helper methods
    private getHeaders(): { headers: HttpHeaders } {
        return { headers: this.requestService.getJsonHeaders() };
    }
}
