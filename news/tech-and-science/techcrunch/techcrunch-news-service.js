module.exports = function () {
    var parseXMLString = require('xml2js').parseString,
        apiConstants = require('../../../common/api-constants.js')(),
        httpService = require('../../../common/http-service.js')(),
        newsModelFactory = require('../../../common/news-model-factory.js')();

    return {
        get: function () {
            var options = httpService.clone(apiConstants.techCrunch);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [];

                parseXMLString(data, function (err, result) {
                    result.rss.channel[0].item.forEach(function (newsItemData) {
                        articlesArray.push(newsModelFactory.get({
                            title: newsItemData.title[0],
                            info: httpService.trim(newsItemData.description[0].replace(/<(?:.|\n)*?>/gm, '')).replace(/&nbsp;/, ''),
                            url: newsItemData.link[0],
                            image: null,
                            dateTime: newsItemData.pubDate[0],
                            provider: 'techcrunch'
                        }));
                    });
                });
                return articlesArray;
            }
        }
    };
};
