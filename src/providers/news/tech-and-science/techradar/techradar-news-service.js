import { apiConstants, apiProvidersConst, httpService, newsModelFactory } from '../../../../common/common.js';

export default class TechRadarNews {
    static get() {
        let options = httpService.clone(apiConstants.techRadar);
        options.path = options.path.replace('{0}', options.token);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
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
