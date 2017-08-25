import xml2js from 'xml2js';
import { apiConstants, httpService, newsModelFactory } from '../../../common/common.js';

export default class CnnNews {
    get() {
        const options = httpService.clone(apiConstants.cnn);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            xml2js.parseString(data, (err, result) => {
                result.rss.channel[0].item.forEach((newsItemData) => {
                    let currentNewsModel = {
                        title: newsItemData.title[0],
                        info: httpService.trim(newsItemData.description ? newsItemData.description[0] : ''),
                        url: newsItemData.link[0],
                        image: newsItemData['media:group'] ? newsItemData['media:group'][0]['media:content'][0]['$'].url : null,
                        dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                        provider: 'cnn'
                    };

                    if (currentNewsModel.info) {
                        articlesArray.push(newsModelFactory.get(currentNewsModel));
                    }
                });
            });
            return articlesArray;
        }
    }
}
