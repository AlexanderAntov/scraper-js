module.exports = function () {
    var http = require('http'),
        https = require('https'),
        apiConstants = require('./api-constants.js')();

    return {
        newYorkTimes: function () {
            var options = clone(apiConstants.newYorkTimes);
            options.path = options.path.replace('{0}', options.token);
            return performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var newsModelsArray = [];
                data.results.forEach(function (newsItemData) {
                    newsModelsArray.push({
                        title: newsItemData.title,
                        shortInfo: newsItemData.abstract,
                        url: newsItemData.url,
                        image: getImageUrl(newsItemData),
                        dateTime: newsItemData['published_date'].replace('T', ' ').split(' ')[0]
                    });
                });
                return newsModelsArray;

                function getImageUrl(data) {
                    if (data.multimedia && data.multimedia.length > 0) {
                        return data.multimedia[0].url;
                    }
                    return null;
                }
            }
        },
        theGuardian: function () {
            var options = clone(apiConstants.theGuardian);
            options.path = options.path.replace('{0}', options.token);
            return performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var newsModelsArray = [];
                data.response.results.forEach(function (newsItemData) {
                    newsModelsArray.push({
                        title: newsItemData.webTitle,
                        shortInfo: getShortInfo(newsItemData),
                        url: newsItemData.webUrl,
                        image: null,
                        dateTime: getDateTime(newsItemData)
                    });
                });
                return newsModelsArray;

                function getShortInfo(data) {
                    if (data.blocks && data.blocks.body && data.blocks.body.length > 0) {
                        return data.blocks.body[0].bodyTextSummary.substring(0, 200) + '...';
                    }
                    return null;
                }

                function getDateTime(data) {
                    if (data.webPublicationDate) {
                        return data.webPublicationDate
                            .replace('T', ' ')
                            .replace('Z', ' ')
                            .split(' ')[0];
                    }
                    return null;
                }
            }
        },
        weatherData: function (cityName) {
            var options = clone(apiConstants.newYorkTimes);
            options.path = options.path
                .replace('{0}', cityName)
                .replace('{1}', options.token);
            return performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                return data;
            }
        }
    };

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function performGetRequest(options, dataTransformer) {
        var httpService = options.isHttps ? https : http;
        return new Promise(function (resolve, reject) {
            var result = '';
            var request = httpService.request(options, callback);

            function callback(response) {
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    result += chunk;
                });

                response.on('end', function () {
                    resolve(dataTransformer(JSON.parse(result)));
                });
            }

            request.on('error', function (err) {
                reject(err);
            });

            request.end();
        });
    }
};