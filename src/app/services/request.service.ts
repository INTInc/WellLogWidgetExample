import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

@Injectable()
export class RequestService {
    constructor() {
    }       
    getJsonHeaders(): Headers {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
