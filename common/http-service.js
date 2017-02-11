module.exports = function () {
    var http = require('http'),
        https = require('https');

    return {
        clone: obj => JSON.parse(JSON.stringify(obj)),
        trim: str => str && str.length > 150 ? str.substring(0, 150) + '...' : str,
        performGetRequest: performGetRequest
    };

    function performGetRequest(options, dataTransformer) {
        var httpService = options.isHttps ? https : http;
        return new Promise(function (resolve, reject) {
            var result = '',
                request = httpService.request(options, callback);

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