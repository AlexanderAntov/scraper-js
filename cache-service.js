module.exports = function () {
    var httpService = require('./http-service.js')();

    return {
        news: function (cache) {
            var newsDataPromises = [
                httpService.newYorkTimes(),
                httpService.theGuardian()
            ];

            Promise.all(newsDataPromises).then(function (dataModelLists) {
                var newsModelsList = [];
                dataModelLists.forEach(function (dataModelList) {
                    newsModelsList = newsModelsList.concat(dataModelList);
                });
                cache.news = newsModelsList;
            });
        },
        weather: function (cache, city) {
            httpService.weatherData(city).then(function (dataModelLists) {
                var weatherModelsList = [];
                dataModelLists.forEach(function (dataModelList) {
                    weatherModelsList = weatherModelsList.concat(dataModelList);
                });
                cache.weather = weatherModelsList;
            });
        }
    };
};