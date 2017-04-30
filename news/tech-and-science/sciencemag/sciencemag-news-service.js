module.exports = function () {
    var parseXMLString = require('xml2js').parseString,
        apiConstants = require('../../../common/api-constants.js')(),
        httpService = require('../../../common/http-service.js')(),
        newsModelFactory = require('../../../common/news-model-factory.js')();

    return {
        get: function () {
            var options = httpService.clone(apiConstants.scienceMag);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [],
                    currentModel = null,
                    currentInfo = null;

                parseXMLString(data, function (err, result) {
                    result['rdf:RDF'].item.forEach(function (newsItemData) {
                        currentInfo = httpService.trim(
                            newsItemData
                                .description[0]
                                .replace(/<(?:.|\n)*?>/gm, '')
                                .replace(/\n/, '')
                        );
                        currentModel = newsModelFactory.get({
                            title: newsItemData.title[0],
                            info: currentInfo,
                            url: newsItemData.link[0],
                            image: null,
                            dateTime: newsItemData['dc:date'][0],
                            provider: 'sciencemag'
                        });

                        if (currentModel.info) {
                            articlesArray.push(currentModel);
                        }
                    });
                });
                return articlesArray;
            }
        }
    };
};
