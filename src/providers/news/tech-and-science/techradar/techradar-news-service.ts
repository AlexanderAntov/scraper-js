import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { NewsModel } from '../../../../common/news-model';
import { NewsProviderBase } from '../../../news-provider-base';
import { apiConstants } from '../../../../common/api-constants';
import { apiProvidersConst } from '../../../../common/api-providers-const';
import isEmpty from 'lodash/isEmpty';

export class TechRadarNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.techRadar);
    }

    transformRawData(data: any): NewsModel[] {
        const articlesArray: NewsModel[] = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            const getInfo = (description: string) => {
                const localDescription = description[0]
                    .replace(/<(?:.|\n)*?>/gm, '')
                    .replace(/&nbsp;/, '');

                return cheerio.load(localDescription).html();
            };

            xml2js.parseString(data, (err: Error, result: any) => {
                result.rss.channel[0].item.forEach((newsItemData: any) => {
                    articlesArray.push(new NewsModel({
                        title: newsItemData.title[0],
                        info: getInfo(newsItemData['dc:content']),
                        trimInfo: true,
                        url: newsItemData.link[0],
                        image: newsItemData.image[0].url,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.techRadar.id
                    }));
                });
            });
            return articlesArray;
    }
}
