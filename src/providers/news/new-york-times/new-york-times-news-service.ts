import { NewsProviderBase } from '../../news-provider-base';
import { NewsModel } from '../../../common/news-model';
import { apiConstants } from '../../../common/api-constants';
import { apiProvidersConst } from '../../../common/api-providers-const';
import isEmpty from 'lodash/isEmpty';

export class NewYorkTimesNewsService extends NewsProviderBase {
    constructor() {
        super(apiConstants.newYorkTimes);
    }

    transformRawData(data: any): NewsModel[] {
        const articlesArray: NewsModel[] = [];
        if (isEmpty(data) || isEmpty(data.results)) {
            return articlesArray;
        }

        data.results.forEach((newsItemData: any) => {
            articlesArray.push(new NewsModel({
                title: newsItemData.title,
                info: newsItemData.abstract,
                url: newsItemData.url,
                image: getImageUrl(newsItemData),
                dateTime: newsItemData['published_date'].replace('T', ' ').split(' ')[0],
                provider: apiProvidersConst.nyt.id
            }));
        });
        return articlesArray;

        function getImageUrl(data: any) {
            if (data.multimedia && data.multimedia.length > 0) {
                return data.multimedia[0].url;
            }
            return null;
        }
    }
}
