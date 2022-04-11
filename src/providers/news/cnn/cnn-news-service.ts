import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { URL } from 'url';
import { performGetRequest } from '../../../common/http.utils';
import { NewsProviderBase } from '../../news-provider-base';
import { NewsModel } from '../../../common/news-model';
import { apiConstants } from '../../../common/api-constants';
import { apiProvidersConst } from '../../../common/api-providers-const';
import { isEmpty } from 'lodash';

export class CnnNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.cnn);
    }

    transformRawData(data: string): NewsModel[] {
        const articlesArray: NewsModel[] = [];
        if (isEmpty(data)) {
            return articlesArray;
        }

        xml2js.parseString(data, (err: Error, result: any) => {
            result.rss.channel[0].item.forEach((newsItemData: any) => {
                let model = new NewsModel({
                    title: newsItemData.title[0],
                    info: newsItemData.description ? newsItemData.description[0] : '',
                    url: newsItemData.link[0],
                    image: newsItemData['media:group'] ? newsItemData['media:group'][0]['media:content'][0]['$'].url : null,
                    dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                    provider: apiProvidersConst.cnn.id
                });

                if (model.info) {
                    articlesArray.push(model);
                }
            });
        });
        return articlesArray;
    }

    scrape(model: NewsModel): Promise<string> {
        const url = new URL(model.url);

        return performGetRequest({
            isApi: false,
            isHttps: true,
            host: 'edition.cnn.com',
            path: url.pathname
        }, (data: string) => {
            const $ = cheerio.load(data);
            let result = '';
            $('.l-container').find('.zn-body__paragraph').each((index: number, elem: any) => {
                result += `${$(elem).text()}\n\n`;
            });
            return result;
        });
    }
}
