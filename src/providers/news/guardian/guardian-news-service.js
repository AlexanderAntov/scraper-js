import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../../common/common.js';
import { isEmpty } from 'lodash';

export default class GuardianNews {
    static get() {
        let options = newsModelService.clone(apiConstants.theGuardian);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data) || isEmpty(data.response) || isEmpty(data.response.results)) {
                return articlesArray;
            }

            data.response.results.forEach(newsItemData => {
                articlesArray.push(newsModelFactory.get({
                    title: newsItemData.webTitle,
                    info: newsItemData.webTitle,
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
