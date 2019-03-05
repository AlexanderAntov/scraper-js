import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { URL } from 'url';
import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class CnnNewsService {
    static get() {
        const options = cloneDeep(apiConstants.cnn);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    let model = new NewsModel({
                        title: newsItemData.title[0],
                        info: newsItemData.description ? newsItemData.description[0] : '',
                        url: newsItemData.link[0],
                        image: newsItemData['media:group'] ? newsItemData['media:group'][0]['media:content'][0]['$'].url : null,
                        dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                        provider: apiProvidersConst.CNN.id
                    });

                    if (model.info) {
                        articlesArray.push(model);
                    }
                });
            });
            return articlesArray;
        }
    }

    static scrape(model) {
        const url = new URL(model.url);

        return HttpService.performGetRequest({
            isApi: false,
            isHttps: true,
            host: 'edition.cnn.com',
            path: url.pathname
        }, (data) => {
            let $ = cheerio.load(data),
                result = '';
            $('.l-container').find('.zn-body__paragraph').each((index, elem) => {
                result += `${$(elem).text()}\n\n`;
            });
            return result;
        });
    }
}
