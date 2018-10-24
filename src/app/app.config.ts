import { Injectable } from '@angular/core';

@Injectable()
export class AppConfig {
    private static cache = {};
    private data: {};
    public static loadInstance(jsonFile: string) {
        return new Promise((resolve, reject) => {

            let xobj = new XMLHttpRequest();
            xobj.overrideMimeType('application/json');
            xobj.open('GET', jsonFile, true);
            xobj.onreadystatechange = () => {
                if (xobj.readyState === 4) {
                    if (xobj.status === 200) {
                        const instance = new AppConfig();
                        instance.init(JSON.parse(xobj.responseText));
                        AppConfig.cache[jsonFile] = instance;
                        resolve();
                    } else {
                        reject('Could not load file');
                    }
                }
            };
            xobj.send(null);
        });
    }
    public static getInstance(jsonFile: string) {
        if (jsonFile in AppConfig.cache) {
            return AppConfig.cache[jsonFile];
        }
        throw new Error('Could not find config did you load it?');
    }

    public get(key: string) {
        if (this.data == null) {
            return null;
        }
        if (key in this.data) {
            return this.data[key];
        }
        return null;
    }
    private init(data: {}) {
        this.data = data;
    }
}
