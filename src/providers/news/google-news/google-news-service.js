import xml2js from 'xml2js';
import { apiConstants, apiProvidersConst, HttpService, NewsModel, NewsModelService } from '../../../common/common.js';
import { fakeNewsFilterService } from '../../../transformers/fake-news-filter/fake-news-filter-service.js'; 
import { isEmpty, cloneDeep } from 'lodash';

export class GoogleNewsService {
    static get() {
        const options = cloneDeep(apiConstants.googleNews);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    const model = new NewsModel({
                        title: newsItemData.title[0],
                        info: newsItemData.description[0].replace(/<(?:.|\n)*?>/gm, '').replace(/&nbsp;/, ''),
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.GOOGLE_BG.id
                    });

                    if (!fakeNewsFilterService.isClickBait(model.getText())) {
                        articlesArray.push(model);
                    }
                });
            });
            return articlesArray;
        }
    }
}