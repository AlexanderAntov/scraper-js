import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { URL } from 'url';
import { apiConstants, apiProvidersConst, httpService, newsModelFactory } from '../../../common/common.js';

export default class BbcNews {
    static get() {
        const options = httpService.clone(apiConstants.bbc);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    articlesArray.push(newsModelFactory.get({
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
        
        return httpService.performGetRequest({
            isApi: false,
            isHttps: false,
            host: url.host,
            path: url.pathname
        }, (data) => {
            let $ = cheerio.load(data),
                result = '';
            $('.story-body__inner').find('p').each((index, elem) => {
                result += ' ' + $(elem).text();
            });
            return result;
        });
    }
}
