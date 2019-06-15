import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class ReutersNewsService {
    static get() {
        const options = cloneDeep(apiConstants.reuters);
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

    static scrape(model) {
        const url = new URL(model.url);

        return HttpService.performGetRequest({
            isApi: false,
            isHttps: false,
            host: url.host,
            path: url.pathname
        }, (data) => {
            let $ = cheerio.load(data),
                result = '';
            $('.StandardArticleBody_body').find('p').each((index, elem) => {
                result += `${$(elem).text()}\n\n`;
            });
            return result;
        });
    }
}
