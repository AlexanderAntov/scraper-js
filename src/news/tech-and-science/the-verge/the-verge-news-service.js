import xml2js from 'xml2js';
import { apiConstants, httpService, newsModelFactory } from '../../../common/common.js';

export default class TheVergeNews {
    get() {
        let options = httpService.clone(apiConstants.theVerge);
        options.path = options.path.replace('{0}', options.token);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            data.articles.forEach((newsItemData) => {
                articlesArray.push(newsModelFactory.get({
                    title: newsItemData.title,
                    info: newsItemData.description,
                    url: newsItemData.url,
                    image: null,
                    dateTime: newsItemData.publishedAt,
                    provider: 'verge'
                }));
            });
            return articlesArray;
        }
    }
}
