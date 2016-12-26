module.exports = function () {
    var apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')();

    return {
        get: function (cityName) {
            var options = httpService.clone(apiConstants.newYorkTimes);
            options.path = options.path
                .replace('{0}', cityName)
                .replace('{1}', options.token);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                return data;
            }
        }
    };
};
