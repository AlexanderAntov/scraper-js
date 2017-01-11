module.exports = function () {
    var fs = require('fs'),
        newYorkTimesService = require('../news/new-york-times/new-york-times-service.js')(),
        theGuardianService = require('../news/the-guardian/the-guardian-service.js')(),
        googleNewsService = require('../news/google-news/google-news-service.js')(),
        cnnNewsService = require('../news/cnn/cnn-news-service.js')()
        heatingSupplyService = require('../technical/heating-supply/heating-supply-service.js')(),
        waterSupplyService = require('../technical/water-supply/water-supply-service.js')(),
        weatherService = require('../news/weather/weather-service.js')();

    var configFilePath = require('path').resolve(__dirname, 'config.json'),
        config;
    if (fs.existsSync(configFilePath)) {
        config = require(configFilePath);
    } else {
        config = {
            cityName: process.env.CITY_NAME,
            suppliersKeyword: process.env.SUPPLIERS_KEYWORD
        };
    }

    return {
        news: function (cache) {
            var newsDataPromises = [
                weatherService.getSummary(config.cityName),
                heatingSupplyService.get(config.suppliersKeyword),
                waterSupplyService.get(config.suppliersKeyword),
                googleNewsService.get(),
                cnnNewsService.get(),
                newYorkTimesService.get(),
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
        weather: function (cache) {
            weatherService.getDetailedForecast(config.cityName).then(function (dataModelList) {
                cache.weather = dataModelList;
            });
        }
    };
};