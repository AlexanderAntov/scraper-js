import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { apiConstants, apiProvidersConst, HttpService, NewsModel, NewsModelService } from '../../../../common/common.js';
import { isEmpty, cloneDeep } from 'lodash';

export class TechRadarNewsService {
    static get() {
        let options = cloneDeep(apiConstants.techRadar);
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
                            ['dc:content'][0]
                            .replace(/<(?:.|\n)*?>/gm, '')
                            .replace(/&nbsp;/, '')
                        )
                    ).text();
                    articlesArray.push(new NewsModel({
                        title: newsItemData.title[0],
                        info: currentInfo,
                        url: newsItemData.link[0],
                        image: newsItemData.image[0].url,
                        dateTime: newsItemData.pubDate[0],
                        provider: apiProvidersConst.TECH_CRUNCH.id
                    }));
                });
            });
            return articlesArray;
        }
    }
}
