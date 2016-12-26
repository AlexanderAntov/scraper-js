module.exports = function () {
    var newYorkTimesService = require('../news/new-york-times/new-york-times-service.js')(),
        theGuardianService = require('../news/the-guardian/the-guardian-service.js')(),
        googleNewsService = require('../news/google-news/google-news-service.js')(),
        heatingSupplyService = require('../technical/heating-supply/heating-supply-service.js')(),
        weatherService = require('../news/weather/weather-service.js')();

    return {
        news: function (cache) {
            var newsDataPromises = [
                heatingSupplyService.get(),
                newYorkTimesService.get(),
                googleNewsService.get(),
                theGuardianService.get()
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
            weatherService.get(city).then(function (dataModelLists) {
                var weatherModelsList = [];
                dataModelLists.forEach(function (dataModelList) {
                    weatherModelsList = weatherModelsList.concat(dataModelList);
                });
                cache.weather = weatherModelsList;
            });
        }
    };
};