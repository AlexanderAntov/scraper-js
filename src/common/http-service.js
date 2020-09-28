import { isFunction } from 'lodash';
import http from 'http';
import https from 'https';

export class HttpService {
    static flattenPromiseAllResolve(resolvesList, modifierFunc) {
        let list = [];
        resolvesList.forEach((modelsList) => {
            list = list.concat(modelsList || []);
        });
        if (isFunction(modifierFunc)) {
            modifierFunc(list);
        }
        return list;
    }

    static performGetRequest(options, dataTransformer) {
        const httpService = options.isHttps ? https : http;
        return new Promise((resolve, reject) => {
            const request = httpService.request(options, callback);
            let result = '';

            function callback(response) {
                response.setEncoding('utf8');
                response.on('data', (chunk) => {
                    result += chunk;
                });

                response.on('end', () => {
                    if (options.isApi) {
                        if (HttpService._isValidJson(result)) {
                            resolve(dataTransformer(JSON.parse(result)));
                        } else {
                            resolve(dataTransformer(null));
                        }
                    } else {
                        resolve(dataTransformer(result));
                    }
                });
            }

            request.on('error', (err) => {
                reject(err);
            });

            request.end();
        });
    }

    static _isValidJson(data) {
        try {
            return data && JSON.parse(data);
        } catch (error) {
            return false;
        }
    }
}