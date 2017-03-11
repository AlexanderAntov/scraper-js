module.exports = function () {
    var cheerio = require('cheerio'),
        apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')(),
        newsModelFactory = require('../../common/news-model-factory.js')();

    return {
        get: function (targetKeyword) {
            var options = httpService.clone(apiConstants.heatingSupply);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var $ = cheerio.load(data),
                    articlesArray = [];
                $('.RowsContainer').eq(0).find('.DataContainer.LeadingInfo.RowEntry').each(function (index, elem) {
                    var articleContainer = $(elem),
                        articleTextBody = articleContainer.find('.Data > .Content').text();
                    if (articleTextBody.toLowerCase().indexOf(targetKeyword.toLowerCase()) > -1) {
                        var dateContainer = articleContainer.find('.Title > .Info');
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
    };
};
