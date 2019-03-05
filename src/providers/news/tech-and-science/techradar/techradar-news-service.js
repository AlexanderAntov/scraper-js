import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class TechRadarNewsService {
    static get() {
        let options = cloneDeep(apiConstants.techRadar);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data) || isEmpty(data.articles)) {
                return articlesArray;
            }

            data.articles.forEach((newsItemData) => {
                articlesArray.push(new NewsModel({
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
