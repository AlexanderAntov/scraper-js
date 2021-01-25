import xml2js from 'xml2js';
import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../common/common.js';
import { fakeNewsFilterService } from '../../../transformers/fake-news-filter/fake-news-filter-service.js'; 
import { isEmpty, cloneDeep } from 'lodash';

export class BtaNewsService {
    static get() {
        const options = cloneDeep(apiConstants.bta);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            const getInfo = (description) => {
                if (!description) {
                    return null;
                }
                return description[0]
                    .replace(/<(?:.|\n)*?>/gm, '')
                    .replace(/&nbsp;/, '')
                    .trim();
            };

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    const model = new NewsModel({
                        title: newsItemData.title[0].substring(5).trim(),
                        info: getInfo(newsItemData.description),
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.BTA.id
                    });

                    if (model.info && !fakeNewsFilterService.isClickBait(model.getText())) {
                        articlesArray.push(model);
                    }
                });
            });
            return articlesArray;
        }
    }
}