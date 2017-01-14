module.exports = function () {
    var cheerio = require('cheerio'),
        apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')();

    return {
        get: function (targetKeyword) {
            var options = httpService.clone(apiConstants.waterSupply);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var $ = cheerio.load(data),
                    articlesArray = [];
                $('#article').find('p').each(function (index, elem) {
                    var articleTextBody = $(elem).text();
                    if (articleTextBody.toLowerCase().indexOf(targetKeyword.toLowerCase()) > -1) {
                        articlesArray.push({
                            title: 'Water shortages',
                            shortInfo: articleTextBody.substring(0, 200) + '...',
                            url: 'http://' + options.host + options.path,
                            image: null,
                            dateTime: new Date().toDateString(),
                            provider: null
                        });
                    }
                });
                return articlesArray;
            }
        }
    };
};
