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

            let currentInfo = null;

            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    currentInfo = cheerio.load(
                        NewsModelService.trim(
                            newsItemData
                            .description[0]
                            .replace(/<(?:.|\n)*?>/gm, '')
                            .replace(/&nbsp;/, '')
                        )
                    ).text();
                    articlesArray.push(new NewsModel({
                        title: newsItemData.title[0],
                        info: currentInfo,
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
