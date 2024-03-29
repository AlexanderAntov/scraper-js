import xml2js from 'xml2js';
import { fakeNewsFilterService } from '../../../transformers/fake-news-filter/fake-news-filter-service';
import { NewsProviderBase } from '../../news-provider-base';
import { NewsModel } from '../../../common/news-model';
import { apiConstants } from '../../../common/api-constants';
import { apiProvidersConst } from '../../../common/api-providers-const';
import isEmpty from 'lodash/isEmpty';

export class BtaNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.bta);
    }

    transformRawData(data: string): NewsModel[] {
        const articlesArray: NewsModel[] = [];
        if (isEmpty(data)) {
            return articlesArray;
        }

        const getInfo = (description: string) => {
            if (!description) {
                return null;
            }
            return description[0]
                .replace(/<(?:.|\n)*?>/gm, '')
                .replace(/&nbsp;/, '')
                .trim();
        };

        xml2js.parseString(data, (err: Error, result: any) => {
            result.rss.channel[0].item.forEach((newsItemData: any) => {
                const model = new NewsModel({
                    title: newsItemData.title[0].substring(5).trim(),
                    info: getInfo(newsItemData.description),
                    url: newsItemData.link[0],
                    image: null,
                    dateTime: newsItemData.pubDate[0],
                    provider: apiProvidersConst.bta.id
                });

                if (model.info && !fakeNewsFilterService.isClickBait(model.getText())) {
                    articlesArray.push(model);
                }
            });
        });
        return articlesArray;
    }
}