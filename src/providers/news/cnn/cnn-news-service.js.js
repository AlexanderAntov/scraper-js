import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { URL } from 'url';
import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../../common/common.js';

export default class CnnNews {
    static get() {
        const options = newsModelService.clone(apiConstants.cnn);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    let currentNewsModel = {
                        title: newsItemData.title[0],
                        info: newsItemData.description ? newsItemData.description[0] : '',
                        url: newsItemData.link[0],
                        image: newsItemData['media:group'] ? newsItemData['media:group'][0]['media:content'][0]['$'].url : null,
                        dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                        provider: apiProvidersConst.CNN.id
                    };

                    if (currentNewsModel.info) {
                        articlesArray.push(newsModelFactory.get(currentNewsModel));
                    }
                });
            });
            return articlesArray;
        }
    }

    static scrape(model) {
        const url = new URL(model.url);

        return httpService.performGetRequest({
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
