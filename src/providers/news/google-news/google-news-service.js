import xml2js from 'xml2js';
import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../../common/common.js';
import { isEmpty } from 'lodash';

export default class GoogleNews {
    static get() {
        const options = newsModelService.clone(apiConstants.googleNews);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    const newsModel = newsModelFactory.get({
                        title: newsItemData.title[0],
                        info: newsItemData.description[0].replace(/<(?:.|\n)*?>/gm, ''),
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.GOOGLE_BG.id
                    });

                    if (newsModelService.textDoesNotContainFakeNewsKeywords(options.fakeNewsBlacklistKeywords, newsModel.info)) {
                        articlesArray.push(newsModel);
                    }
                });
            });
            return articlesArray;
        }
    }
}
