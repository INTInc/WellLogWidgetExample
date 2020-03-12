import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class RequestService {
    constructor() {
    }       
    getJsonHeaders(): HttpHeaders {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
