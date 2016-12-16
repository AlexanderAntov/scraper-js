module.exports = function () {
    var http = require('http'),
        https = require('https'),
        cheerio = require('cheerio'),
        parseXMLString = require('xml2js').parseString,
        apiConstants = require('./api-constants.js')();

    return {
        newYorkTimes: function () {
            var options = clone(apiConstants.newYorkTimes);
            options.path = options.path.replace('{0}', options.token);
            return performGetRequest(options, dataTransformer);

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
        },
        theGuardian: function () {
            var options = clone(apiConstants.theGuardian);
            options.path = options.path.replace('{0}', options.token);
            return performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [];
                data.response.results.forEach(function (newsItemData) {
                    articlesArray.push({
                        title: newsItemData.webTitle,
                        shortInfo: getShortInfo(newsItemData),
                        url: newsItemData.webUrl,
                        image: null,
                        dateTime: getDateTime(newsItemData)
                    });
                });
                return articlesArray;

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
        googleNews: function () {
            var options = clone(apiConstants.googleNews);
            return performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var articlesArray = [];

                parseXMLString(data, function (err, result) {
                    result.rss.channel[0].item.forEach(function (newsItemData) {
                        articlesArray.push({
                            title: newsItemData.title[0],
                            shortInfo: newsItemData.description[0].replace(/<(?:.|\n)*?>/gm, '').substring(0, 200) + '...',
                            url: newsItemData.link[0],
                            image: null,
                            dateTime: newsItemData.pubDate[0]
                        });
                    });
                });
                return articlesArray;
            }
        },
        heatingSupply: function () {
            var options = clone(apiConstants.heatingSupply);
            return performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var $ = cheerio.load(data),
                    articlesArray = [];
                $('.RowsContainer').eq(0).find('.DataContainer.LeadingInfo.RowEntry').each(function (index, elem) {
                    var articleContainer = $(elem),
                        articleTextBody = articleContainer.find('.Data > .Content').text();
                    if (articleTextBody.toLowerCase().indexOf('красна поляна') > -1) {
                        var dateContainer = articleContainer.find('.Title > .Info');
                        articlesArray.push({
                            title: articleContainer.find('.Table > .Cell').text().trim().replace('/n', ''),
                            shortInfo: articleTextBody.substring(0, 200) + '...',
                            url: 'http://' + options.host + articleContainer.find('.Button.FRight').attr('href'),
                            image: null,
                            dateTime: dateContainer.find('.Value').text() + ' ' + dateContainer.find('.Desc').text()
                        });
                    }
                });
                return articlesArray;
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
                    if (options.isApi) {
                        resolve(dataTransformer(JSON.parse(result)));
                    } else {
                        resolve(dataTransformer(result));
                    }
                });
            }

            request.on('error', function (err) {
                reject(err);
            });

            request.end();
        });
    }
};