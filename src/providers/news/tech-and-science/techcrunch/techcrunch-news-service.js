import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { apiConstants, apiProvidersConst, HttpService, NewsModel, NewsModelService } from '../../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class TechCrunchNewsService {
    static get() {
        const options = cloneDeep(apiConstants.techCrunch);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            if (isEmpty(data)) {
                return articlesArray;
            }

            const getInfo = (description) => {
                const localDescription = description[0]
                    .replace(/<(?:.|\n)*?>/gm, '')
                    .replace(/&nbsp;/, '');

                return cheerio.load(
                    NewsModelService.trim(localDescription)
                ).text();
            };

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    articlesArray.push(new NewsModel({
                        title: newsItemData.title[0],
                        info: getInfo(newsItemData.description),
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.TECH_CRUNCH.id
                    }));
                });
            });
            return articlesArray;
        }
    }
}
