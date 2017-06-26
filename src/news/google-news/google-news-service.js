﻿import xml2js from 'xml2js';
import { apiConstants, httpService, newsModelFactory } from '../../common/common.js';

class GoogleNews {
    get() {
        const options = httpService.clone(apiConstants.googleNews);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            let articlesArray = [];

            xml2js.parseString(data, function (err, result) {
                result.rss.channel[0].item.forEach(function (newsItemData) {
                    articlesArray.push(newsModelFactory.get({
                        title: newsItemData.title[0],
                        info: httpService.trim(newsItemData.description[0].replace(/<(?:.|\n)*?>/gm, '')),
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: 'google'
                    }));
                });
            });
            return articlesArray;
        }
    }
}

module.exports = GoogleNews;
