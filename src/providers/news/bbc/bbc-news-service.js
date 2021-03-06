﻿import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { URL } from 'url';
import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class BbcNewsService {
    static get() {
        const options = cloneDeep(apiConstants.bbc);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    articlesArray.push(new NewsModel({
                        title: newsItemData.title[0],
                        info: newsItemData.description ? newsItemData.description[0] : '',
                        url: newsItemData.link[0],
                        image: newsItemData['media:thumbnail'] ? newsItemData['media:thumbnail'][0]['$'].url : null,
                        dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                        provider: apiProvidersConst.BBC.id
                    }));
                });
            });
            return articlesArray;
        }
    }

    static scrape(model) {
        const url = new URL(model.url);
        
        return HttpService.performGetRequest({
            isApi: false,
            isHttps: false,
            host: url.host,
            path: url.pathname
        }, (data) => {
            let $ = cheerio.load(data);
            let result = '';
            $('article').find('p').each((index, elem) => {
                result += `${$(elem).text()}\n\n`;
            });
            return result;
        });
    }
}
