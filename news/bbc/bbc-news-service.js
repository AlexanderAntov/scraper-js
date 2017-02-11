module.exports = function () {
    var parseXMLString = require('xml2js').parseString,
        apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')();

    return {
        get: function () {
            var options = httpService.clone(apiConstants.bbc);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [];
                parseXMLString(data, function (err, result) {
                    parseXMLString(data, function (err, result) {
                        result.rss.channel[0].item.forEach(function (newsItemData) {
                            articlesArray.push({
                                title: newsItemData.title[0],
                                shortInfo: httpService.trim(newsItemData.description ? newsItemData.description[0] : ''),
                                url: newsItemData.link[0],
                                image: newsItemData['media:thumbnail'] ? newsItemData['media:thumbnail'][0]['$'].url : null,
                                dateTime: newsItemData.pubDate ? newsItemData.pubDate[0] : '',
                                provider: 'bbc'
                            });
                        });
                    });
                });
                return articlesArray;
            }
        }
    };
};
