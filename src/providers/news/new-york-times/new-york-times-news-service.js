import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../../common/common.js';
import { isEmpty } from 'lodash';

export default class NewYorkTimesNews {
    static get() {
        let options = newsModelService.clone(apiConstants.newYorkTimes);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data) || isEmpty(data.results)) {
                return articlesArray;
            }

            data.results.forEach(newsItemData => {
                articlesArray.push(newsModelFactory.get({
                    title: newsItemData.title,
                    info: newsItemData.abstract,
                    url: newsItemData.url,
                    image: getImageUrl(newsItemData),
                    dateTime: newsItemData['published_date'].replace('T', ' ').split(' ')[0],
                    provider: apiProvidersConst.NYT.id
                }));
            });
            return articlesArray;

            function getImageUrl(data) {
                if (data.multimedia && data.multimedia.length > 0) {
                    return data.multimedia[0].url;
                }
                return null;
            }
        }
    }
}
