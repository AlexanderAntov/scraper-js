module.exports = function () {
    var cheerio = require('cheerio'),
        parseXMLString = require('xml2js').parseString,
        apiConstants = require('../../../common/api-constants.js')(),
        httpService = require('../../../common/http-service.js')(),
        newsModelFactory = require('../../../common/news-model-factory.js')();

    return {
        get: function () {
            var options = httpService.clone(apiConstants.techCrunch);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [],
                    currentInfo = null;

                parseXMLString(data, function (err, result) {
                    result.rss.channel[0].item.forEach(function (newsItemData) {
                        currentInfo = cheerio.load(
                            httpService.trim(
                                newsItemData
                                .description[0]
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
                            provider: 'techcrunch'
                        }));
                    });
                });
                return articlesArray;
            }
        }
    };
};
