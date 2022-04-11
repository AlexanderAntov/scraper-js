import http from 'http';
import https from 'https';
import { NewsModel } from './news-model';
import { ProviderConfig } from './api-constants';

export const flattenPromiseAllResolve = (resolvesList: NewsModel[][], modifierFunc?: Function): NewsModel[] => {
    let list: NewsModel[] = [];
    resolvesList.forEach((modelsList) => {
        list = list.concat(modelsList || []);
    });
    if (modifierFunc) {
        modifierFunc(list);
    }
    return list;
};

export const performGetRequest = (config: ProviderConfig, dataTransformer: Function): Promise<any> => {
    const httpService = config.isHttps ? https : http;
    return new Promise((resolve, reject) => {
        const request: http.ClientRequest = httpService.request(config, onResponse);
        let result = '';

        function onResponse(response: http.IncomingMessage) {
            response.setEncoding('utf8');
            response.on('data', (chunk: string) => {
                result += chunk;
            });

            response.on('end', () => {
                if (config.isApi) {
                    if (isValidJson(result)) {
                        resolve(dataTransformer(JSON.parse(result)));
                    } else {
                        resolve(dataTransformer(null));
                    }
                } else {
                    resolve(dataTransformer(result));
                }
            });
        }

        request.on('error', (error: Error) => {
            reject(error);
        });

        request.end();
    });
};

const isValidJson = (data: string) => {
    try {
        return data && JSON.parse(data);
    } catch (error) {
        return false;
    }
};
