import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class GuardianNewsService {
    static get() {
        let options = cloneDeep(apiConstants.theGuardian);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data) || isEmpty(data.response) || isEmpty(data.response.results)) {
                return articlesArray;
            }

            data.response.results.forEach(newsItemData => {
                articlesArray.push(new NewsModel({
                    title: newsItemData.webTitle,
                    info: '',
                    url: newsItemData.webUrl,
                    image: null,
                    dateTime: newsItemData.webPublicationDate,
                    provider: apiProvidersConst.THE_GUARDIAN.id
                }));
            });
            return articlesArray;
        }
    }
}
