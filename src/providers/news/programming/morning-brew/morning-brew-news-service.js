import xml2js from 'xml2js';
import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class MorningBrewNewsService {
    static get() {
        const options = cloneDeep(apiConstants.theMorningBrew);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    articlesArray.push(new NewsModel({
                        title: newsItemData.title[0],
                        info: newsItemData.description[0],
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.THE_MORNING_BREW.id
                    }));
                });
            });
            return articlesArray;
        }
    }
}
