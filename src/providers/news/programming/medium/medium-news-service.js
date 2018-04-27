import xml2js from 'xml2js';
import cheerio from 'cheerio';
import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../../../common/common.js';

export default class MediumNews {
    static get() {
        return Promise.all([
            MediumNews.getSingleThread('artificial-intelligence'),
            MediumNews.getSingleThread('software-engineering'),
            MediumNews.getSingleThread('data-science'),
            MediumNews.getSingleThread('webpack'),
            MediumNews.getSingleThread('automation'),
            MediumNews.getSingleThread('machine-learning')
        ]).then((resolves) => {
            return httpService.flattenPromiseAllResolve(resolves, null);
        });
    }

    static getSingleThread(threadName) {
        let options = newsModelService.clone(apiConstants.medium);
        options.path += threadName;
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            let currentInfo = null;

            xml2js.parseString(data, (err, result) => {
                if (result.rss.channel[0].item) {
                    result.rss.channel[0].item.forEach((newsItemData) => {
                        currentInfo = cheerio.load(
                            newsModelService.trim(
                                newsItemData['content:encoded'][0]
                                    .replace(/<(?:.|\n)*?>/gm, '')
                                    .replace(/&nbsp;/, '')
                            )
                        ).text();
                        articlesArray.push(newsModelFactory.get({
                            title: newsItemData.title[0],
                            info: currentInfo,
                            url: newsItemData.link[0],
                            image: null,
                            dateTime: newsItemData.pubDate[0],
                            provider: apiProvidersConst.MEDIUM.id
                        }));
                    });
                }
            });
            return articlesArray;
        }
    }
}
