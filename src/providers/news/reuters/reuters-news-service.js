﻿import xml2js from 'xml2js';
import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../../common/common.js';
import { isEmpty } from 'lodash';

export default class ReutersNews {
    static get() {
        const options = newsModelService.clone(apiConstants.reuters);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    articlesArray.push(newsModelFactory.get({
                        title: newsItemData.title[0],
                        info: newsItemData.description[0].replace(/(<([^>]+)>)/ig, ''),
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.REUTERS.id
                    }));
                });
            });
            return articlesArray;
        }
    }
}
