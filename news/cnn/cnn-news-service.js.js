module.exports = function () {
    var parseXMLString = require('xml2js').parseString,
        apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')(),
        newsModelFactory = require('../../common/news-model-factory.js')();

    return {
        get: function () {
            var options = httpService.clone(apiConstants.cnn);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [];
                parseXMLString(data, function (err, result) {
                    result.rss.channel[0].item.forEach(function (newsItemData) {
                        var currentNewsModel = {
                            title: newsItemData.title[0],
                            shortInfo: httpService.trim(newsItemData.description ? newsItemData.description[0] : ''),
                            url: newsItemData.link[0],
                            image: newsItemData['media:group'] ? newsItemData['media:group'][0]['media:content'][0]['$'].url : null,
                            dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                            provider: 'cnn'
                        };

                        if (currentNewsModel.shortInfo) {
                            articlesArray.push(newsModelFactory.get(currentNewsModel));
                        }
                    });
                });
                return articlesArray;
            }
        }
    };
};
