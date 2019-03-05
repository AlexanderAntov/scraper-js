import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class NewYorkTimesNewsService {
    static get() {
        let options = cloneDeep(apiConstants.newYorkTimes);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data) || isEmpty(data.results)) {
                return articlesArray;
            }

            data.results.forEach(newsItemData => {
                articlesArray.push(new NewsModel({
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
