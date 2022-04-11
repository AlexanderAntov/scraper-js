import xml2js from 'xml2js';
import { NewsModel } from '../../../common/news-model';
import { NewsProviderBase } from '../../news-provider-base';
import { apiConstants } from '../../../common/api-constants';
import { apiProvidersConst } from '../../../common/api-providers-const';
import isEmpty from 'lodash/isEmpty';

export class ReutersNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.reuters);
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
                    info: newsItemData.description[0].replace(/(<([^>]+)>)/ig, ''),
                    url: newsItemData.link[0],
                    image: null,
                    dateTime: newsItemData.pubDate[0],
                    provider: apiProvidersConst.reuters.id
                }));
            });
        });
        return articlesArray;
    }
}
