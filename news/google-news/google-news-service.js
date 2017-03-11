module.exports = function () {
    var parseXMLString = require('xml2js').parseString,
        apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')(),
        newsModelFactory = require('../../common/news-model-factory.js')();

    return {
        get: function () {
            var options = httpService.clone(apiConstants.googleNews);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [];

                parseXMLString(data, function (err, result) {
                    result.rss.channel[0].item.forEach(function (newsItemData) {
                        articlesArray.push(newsModelFactory.get({
                            title: newsItemData.title[0],
                            shortInfo: httpService.trim(newsItemData.description[0].replace(/<(?:.|\n)*?>/gm, '')),
                            url: newsItemData.link[0],
                            image: null,
                            dateTime: newsItemData.pubDate[0],
                            provider: 'google'
                        }));
                    });
                });
                return articlesArray;
            }
        }
    };
};
