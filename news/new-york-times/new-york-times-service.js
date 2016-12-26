module.exports = function () {
    var apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')();

    return {
        get: function () {
            var options = httpService.clone(apiConstants.newYorkTimes);
            options.path = options.path.replace('{0}', options.token);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [];
                data.results.forEach(function (newsItemData) {
                    articlesArray.push({
                        title: newsItemData.title,
                        shortInfo: newsItemData.abstract,
                        url: newsItemData.url,
                        image: getImageUrl(newsItemData),
                        dateTime: newsItemData['published_date'].replace('T', ' ').split(' ')[0]
                    });
                });
                return articlesArray;

                function getImageUrl(data) {
                    if (data.multimedia && data.multimedia.length > 0) {
                        return data.multimedia[0].url;
                    }
                    return null;
                }
            }
        }
    };
};
