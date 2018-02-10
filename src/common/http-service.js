import http from 'http';
import https from 'https';

export default class HttpService {
    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static trim(str) {
        return str && str.length > 150 ? str.substring(0, 150) + '...' : str;
    }

    static performGetRequest(options, dataTransformer) {
        const httpService = options.isHttps ? https : http;
        return new Promise((resolve, reject) => {
            let result = '',
                request = httpService.request(options, callback);

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