import * as fs from 'fs';
import newYorkTimesNewsService from '../news/new-york-times/new-york-times-news-service.js';
import theGuardianNewsService from '../news/the-guardian/the-guardian-news-service.js';
import googleNewsService from '../news/google-news/google-news-service.js';
import cnnNewsService from '../news/cnn/cnn-news-service.js';
import bbcNewsService from '../news/bbc/bbc-news-service.js';
import heatingSupplyService from '../technical/heating-supply/heating-supply-service.js';
import waterSupplyService from '../technical/heating-supply/heating-supply-service.js';
import weatherService from '../news/weather/weather-service.js';
import techCrunchNewsService from '../news/tech-and-science/techcrunch/techcrunch-news-service.js';
import scienceMagNewsService from '../news/tech-and-science/sciencemag/sciencemag-news-service.js';

module.exports = (() => {
    const configFilePath = require('path').resolve(__dirname, 'config.json');
    let config;
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
                new weatherService().getSummary(config.cityName),
                new heatingSupplyService().get(config.suppliersKeyword),
                new waterSupplyService().get(config.suppliersKeyword),
                new googleNewsService().get(),
                new cnnNewsService().get(),
                new newYorkTimesNewsService().get(),
                new bbcNewsService().get(),
                new theGuardianNewsService().get()
            ];

            var techAndScienceNewsPromises = [
                new techCrunchNewsService().get(),
                new scienceMagNewsService().get()
            ];

            Promise.all(newsDataPromises).then(function (dataModelLists) {
                var newsModelsList = [];
                dataModelLists.forEach(function (dataModelList) {
                    newsModelsList = newsModelsList.concat(dataModelList);
                });
                cache.news = newsModelsList;
            });

            Promise.all(techAndScienceNewsPromises).then(function (dataModelLists) {
                var newsModelsList = [];
                dataModelLists.forEach(function (dataModelList) {
                    newsModelsList = newsModelsList.concat(dataModelList);
                });
                cache.techAndScience = newsModelsList;
            });
        },
        weather: function (cache) {
            new weatherService().getDetailedForecast(config.cityName).then(function (data) {
                cache.weather = data.mappedData;
                cache.weatherRaw = data.rawData;
            });
        }
    };
})();