import { apiConstants, httpService, newsModelFactory } from '../../common/common.js';

export default class TheGuardianNews {
    get() {
        let options = httpService.clone(apiConstants.theGuardian);
        options.path = options.path.replace('{0}', options.token);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            var articlesArray = [];
            data.response.results.forEach((newsItemData) => {
                articlesArray.push(newsModelFactory.get({
                    title: newsItemData.webTitle,
                    info: getShortInfo(newsItemData),
                    url: newsItemData.webUrl,
                    image: null,
                    dateTime: getDateTime(newsItemData),
                    provider: 'guardian'
                }));
            });
            return articlesArray;

            function getShortInfo(data) {
                if (data.blocks && data.blocks.body && data.blocks.body.length > 0) {
                    return httpService.trim(data.blocks.body[0].bodyTextSummary);
                }
                return null;
            }

            function getDateTime(data) {
                if (data.webPublicationDate) {
                    return data.webPublicationDate
                        .replace('T', ' ')
                        .replace('Z', ' ')
                        .split(' ')[0];
                }
                return null;
            }
        }
    }
}
