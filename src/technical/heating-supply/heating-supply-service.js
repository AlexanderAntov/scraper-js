import cheerio from 'cheerio';
import { apiConstants, httpService, newsModelFactory } from '../../common/common.js';

export default class HeatingSupply {
    get(targetKeyword) {
        const options = httpService.clone(apiConstants.heatingSupply);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const articlesArray = [];
            let $ = cheerio.load(data);
            $('.RowsContainer').eq(0).find('.DataContainer.LeadingInfo.RowEntry').each(function (index, elem) {
                let articleContainer = $(elem),
                    articleTextBody = articleContainer.find('.Data > .Content').text();
                if (articleTextBody.toLowerCase().indexOf(targetKeyword.toLowerCase()) > -1) {
                    let dateContainer = articleContainer.find('.Title > .Info');
                    articlesArray.push(newsModelFactory.get({
                        title: articleContainer.find('.Table > .Cell').text().trim().replace('/n', ''),
                        info: articleTextBody.substring(0, 200) + '...',
                        url: 'http://' + options.host + articleContainer.find('.Button.FRight').attr('href'),
                        image: null,
                        dateTime: dateContainer.find('.Value').text() + ' ' + dateContainer.find('.Desc').text(),
                        provider: null
                    }));
                }
            });
            return articlesArray;
        }
    }
}
