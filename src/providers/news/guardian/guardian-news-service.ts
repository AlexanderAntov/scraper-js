import { NewsProviderBase } from '../../news-provider-base';
import { NewsModel } from '../../../common/news-model';
import { apiConstants } from '../../../common/api-constants';
import { apiProvidersConst } from '../../../common/api-providers-const';
import isEmpty from 'lodash/isEmpty';

export class GuardianNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.theGuardian);
    }

    transformRawData(data: any): NewsModel[] {
        const articlesArray: NewsModel[] = [];
        if (isEmpty(data?.response?.results)) {
            return articlesArray;
        }

        data.response.results.forEach((newsItemData: any) => {
            articlesArray.push(new NewsModel({
                title: newsItemData.webTitle,
                info: '',
                url: newsItemData.webUrl,
                image: null,
                dateTime: newsItemData.webPublicationDate,
                provider: apiProvidersConst.guardian.id
            }));
        });
        return articlesArray;
    }
}
