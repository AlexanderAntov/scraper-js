import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../../../common/common.js';
import { isEmpty } from 'lodash';

export default class TechRadarNews {
    static get() {
        let options = newsModelService.clone(apiConstants.techRadar);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data) || isEmpty(data.articles)) {
                return articlesArray;
            }

            data.articles.forEach((newsItemData) => {
                articlesArray.push(newsModelFactory.get({
                    title: newsItemData.title,
                    info: newsItemData.description,
                    url: newsItemData.url,
                    image: newsItemData.urlToImage,
                    dateTime: newsItemData.publishedAt,
                    provider: apiProvidersConst.TECH_RADAR.id
                }));
            });
            return articlesArray;
        }
    }
}
