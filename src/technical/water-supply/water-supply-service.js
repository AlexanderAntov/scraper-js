import cheerio from 'cheerio';
import { apiConstants, httpService, newsModelFactory } from '../../common/common.js';

export default class WaterSupply {
    get(targetKeyword) {
        const options = httpService.clone(apiConstants.waterSupply);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            let $ = cheerio.load(data),
                articlesArray = [];
            $('#article').find('p').each(function (index, elem) {
                let articleTextBody = $(elem).text();
                if (articleTextBody.toLowerCase().indexOf(targetKeyword.toLowerCase()) > -1) {
                    articlesArray.push(newsModelFactory.get({
                        title: 'Water shortages',
                        info: articleTextBody.substring(0, 200) + '...',
                        url: 'http://' + options.host + options.path,
                        image: null,
                        dateTime: new Date().toDateString(),
                        provider: null
                    }));
                }
            });
            return articlesArray;
        }
    }
}