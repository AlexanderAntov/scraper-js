import { NewsModel } from '../../../../common/news-model';
import { NewsProviderBase } from '../../../news-provider-base';
import { apiConstants } from '../../../../common/api-constants';
import { apiProvidersConst } from '../../../../common/api-providers-const';
import isEmpty from 'lodash/isEmpty';

export class VergeNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.verge);
    }

    transformRawData(data: any): NewsModel[] {
        const articlesArray: NewsModel[] = [];
            if (isEmpty(data?.articles)) {
                return articlesArray;
            }

            data.articles.forEach((newsItemData: any) => {
                articlesArray.push(new NewsModel({
                    title: newsItemData.title,
                    info: newsItemData.description,
                    url: newsItemData.url,
                    image: newsItemData.urlToImage,
                    dateTime: newsItemData.publishedAt,
                    provider: apiProvidersConst.verge.id
                }));
            });
            return articlesArray;
    }
}
