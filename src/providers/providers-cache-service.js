import * as fs from 'fs';
import * as path from 'path';
import httpService from '../common/http-service.js';
import newYorkTimesNewsService from './news/new-york-times/new-york-times-news-service.js';
import googleNewsService from './news/google-news/google-news-service.js';
import cnnNewsService from './news/cnn/cnn-news-service.js.js';
import bbcNewsService from './news/bbc/bbc-news-service.js';
import reutersNewsService from './news/reuters/reuters-news-service.js';
import heatingSupplyService from './utilities/heating-supply/heating-supply-service.js';
import waterSupplyService from './utilities/water-supply/water-supply-service.js';
import airPollutionService from './weather/air-pollution-service.js';
import weatherService from './weather/weather-service.js';
import techCrunchNewsService from './news/tech-and-science/techcrunch/techcrunch-news-service.js';
import theVergeNewsService from './news/tech-and-science/the-verge/the-verge-news-service.js';
import techRadarNewsService from './news/tech-and-science/techradar/techradar-news-service.js';
import mediumNewsService from './news/programming/medium/medium-news-service.js';
import theMorningBrewNewsService from './news/programming/the-morning-brew/the-morning-brew-news-service.js';

export default (() => {
    const configFilePath = path.resolve(__dirname, '../common/config.json');
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
            const newsDataPromises = [
                weatherService.getSummary(config.cityName),
                airPollutionService.getSummary(),
                heatingSupplyService.get(config.suppliersKeyword),
                waterSupplyService.get(config.suppliersKeyword),
                googleNewsService.get(),
                cnnNewsService.get(),
                newYorkTimesNewsService.get(),
                bbcNewsService.get(),
                reutersNewsService.get()
            ];

            const techPromises = [
                theVergeNewsService.get(),
                techCrunchNewsService.get(),
                techRadarNewsService.get()
            ];

            const programmingPromises = [
                mediumNewsService.get(),
                theMorningBrewNewsService.get()
            ];

            return Promise.all(newsDataPromises).then((resolves) =>  {
                return httpService.flattenPromiseAllResolve(resolves, (list) => {
                    cache.news = list;
                });
            }).then(() => {
                return Promise.all(techPromises).then((resolves) => {
                    return httpService.flattenPromiseAllResolve(resolves, (list) => {
                        cache.techAndScience = list;
                    });
                })
            }).then(() => {
                return Promise.all(programmingPromises).then((resolves) => {
                    return httpService.flattenPromiseAllResolve(resolves, (list) => {
                        cache.programming = list;
                    });
                })
            }).catch((error) => {
                console.error(error);
            });
        },
        weather: (cache) => {
            weatherService.getDetailedForecast(config.cityName).then((data) => {
                cache.weather = data.mappedData;
                cache.weatherRaw = data.rawData;
            }).catch((error) => {
                console.error(error);
            });
        }
    };
})();
