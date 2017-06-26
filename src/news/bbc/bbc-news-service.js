﻿import xml2js from 'xml2js';
import { apiConstants, httpService, newsModelFactory } from '../../common/common.js';

class BbcNews {
    get() {
        const options = httpService.clone(apiConstants.bbc);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            var articlesArray = [];
            xml2js.parseString(data, function (err, result) {
                result.rss.channel[0].item.forEach(function (newsItemData) {
                    articlesArray.push(newsModelFactory.get({
                        title: newsItemData.title[0],
                        info: httpService.trim(newsItemData.description ? newsItemData.description[0] : ''),
                        url: newsItemData.link[0],
                        image: newsItemData['media:thumbnail'] ? newsItemData['media:thumbnail'][0]['$'].url : null,
                        dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                        provider: 'bbc'
                    }));
                });
            });
            return articlesArray;
        }
    }
}

module.exports = BbcNews;
