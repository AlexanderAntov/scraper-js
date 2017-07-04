import { apiConstants, httpService, newsModelFactory } from '../../common/common.js';

export default class NewYorkTimesNews {
    get() {
        let options = httpService.clone(apiConstants.newYorkTimes);
        options.path = options.path.replace('{0}', options.token);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            data.results.forEach((newsItemData) => {
                articlesArray.push(newsModelFactory.get({
                    title: newsItemData.title,
                    info: httpService.trim(newsItemData.abstract),
                    url: newsItemData.url,
                    image: getImageUrl(newsItemData),
                    dateTime: newsItemData['published_date'].replace('T', ' ').split(' ')[0],
                    provider: 'nyt'
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
