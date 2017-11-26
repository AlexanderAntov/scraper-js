import * as fs from 'fs';
import newYorkTimesNewsService from './providers/news/new-york-times/new-york-times-news-service.js';
import googleNewsService from './providers/news/google-news/google-news-service.js';
import cnnNewsService from './providers/news/cnn/cnn-news-service.js.js';
import bbcNewsService from './providers/news/bbc/bbc-news-service.js';
import reutersNewsService from './providers/news/reuters/reuters-news-service.js';
import heatingSupplyService from './providers/utilities/heating-supply/heating-supply-service.js';
import waterSupplyService from './providers/utilities/water-supply/water-supply-service.js';
import weatherService from './providers/weather/weather-service.js';
import techCrunchNewsService from './providers/news/tech-and-science/techcrunch/techcrunch-news-service.js';
import theVergeNewsService from './providers/news/tech-and-science/the-verge/the-verge-news-service.js';

module.exports = (() => {
    const configFilePath = require('path').resolve(__dirname, 'common/config.json');
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
        news: (cache) => {
            var newsDataPromises = [
                new weatherService().getSummary(config.cityName),
                new heatingSupplyService().get(config.suppliersKeyword),
                new waterSupplyService().get(config.suppliersKeyword),
                new googleNewsService().get(),
                new cnnNewsService().get(),
                new newYorkTimesNewsService().get(),
                new bbcNewsService().get(),
                new reutersNewsService().get()
            ];

            var techAndScienceNewsPromises = [
                new theVergeNewsService().get(),
                new techCrunchNewsService().get()
            ];

            return Promise.all(newsDataPromises).then((dataModelLists) =>  {
                var newsModelsList = [];
                dataModelLists.forEach((dataModelList) => {
                    newsModelsList = newsModelsList.concat(dataModelList || []);
                });
                cache.news = newsModelsList;
                return dataModelLists;
            }).then(() => {
                return Promise.all(techAndScienceNewsPromises).then((dataModelLists) => {
                    var newsModelsList = [];
                    dataModelLists.forEach((dataModelList) => {
                        newsModelsList = newsModelsList.concat(dataModelList || []);
                    });
                    cache.techAndScience = newsModelsList;
                    return dataModelLists;
                });
            });
        },
        weather: (cache) => {
            new weatherService().getDetailedForecast(config.cityName).then(function (data) {
                cache.weather = data.mappedData;
                cache.weatherRaw = data.rawData;
            });
        }
    };
})();
