import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { apiConstants, httpService, newsModelFactory } from '../../../common/common.js';

export default class TechCrunchNews {
    get() {
        const parseXMLString = require('xml2js').parseString,
            options = httpService.clone(apiConstants.techCrunch);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            let articlesArray = [],
                currentInfo = null;

            xml2js.parseString(data, function (err, result) {
                result.rss.channel[0].item.forEach(function (newsItemData) {
                    currentInfo = cheerio.load(
                        httpService.trim(
                            newsItemData
                            .description[0]
                            .replace(/<(?:.|\n)*?>/gm, '')
                            .replace(/&nbsp;/, '')
                        )
                    ).text();
                    articlesArray.push(newsModelFactory.get({
                        title: newsItemData.title[0],
                        info: currentInfo,
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: 'techcrunch'
                    }));
                });
            });
            return articlesArray;
        }
    }
}
