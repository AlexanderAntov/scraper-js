import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { URL } from 'url';
import { performGetRequest } from '../../../common/http.utils';
import { NewsProviderBase } from '../../news-provider-base';
import { NewsModel } from '../../../common/news-model';
import { apiConstants } from '../../../common/api-constants';
import { apiProvidersConst } from '../../../common/api-providers-const';
import isEmpty from 'lodash/isEmpty';

export class BbcNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.bbc);
    }

    transformRawData(data: string): NewsModel[] {
        const articlesArray: NewsModel[] = [];
        if (isEmpty(data)) {
            return articlesArray;
        }

        xml2js.parseString(data, (err: Error, result: any) => {
            result.rss.channel[0].item.forEach((newsItemData: any) => {
                articlesArray.push(new NewsModel({
                    title: newsItemData.title[0],
                    info: newsItemData.description ? newsItemData.description[0] : '',
                    url: newsItemData.link[0],
                    image: newsItemData['media:thumbnail'] ? newsItemData['media:thumbnail'][0]['$'].url : null,
                    dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                    provider: apiProvidersConst.bbc.id
                }));
            });
        });
        return articlesArray;
    }

    scrape(model: NewsModel): Promise<string> {
        const url = new URL(model.url);
        
        return performGetRequest({
            isApi: false,
            isHttps: false,
            host: url.host,
            path: url.pathname
        }, (data: string) => {
            let $ = cheerio.load(data);
            let result = '';
            $('article').find('p').each((index: number, elem: any) => {
                result += `${$(elem).text()}\n\n`;
            });
            return result;
        });
    }
}
