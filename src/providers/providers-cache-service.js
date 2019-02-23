import * as fs from 'fs';
import * as path from 'path';
import httpService from '../common/http-service.js';
import newYorkTimesNewsService from './news/new-york-times/new-york-times-news-service.js';
import googleNewsService from './news/google-news/google-news-service.js';
import cnnNewsService from './news/cnn/cnn-news-service.js.js';
import bbcNewsService from './news/bbc/bbc-news-service.js';
import reutersNewsService from './news/reuters/reuters-news-service.js';
import guardianNewsService from './news/guardian/guardian-news-service.js';
import heatingSupplyService from './utilities/heating-supply/heating-supply-service.js';
import waterSupplyService from './utilities/water-supply/water-supply-service.js';
import airPollutionService from './weather/air-pollution-service.js';
import weatherService from './weather/weather-service.js';
import techCrunchNewsService from './news/tech-and-science/techcrunch/techcrunch-news-service.js';
import theVergeNewsService from './news/tech-and-science/the-verge/the-verge-news-service.js';
import techRadarNewsService from './news/tech-and-science/techradar/techradar-news-service.js';
import engadgetNewsService from './news/tech-and-science/engadget/engadget-news-service.js';
import theMorningBrewNewsService from './news/programming/the-morning-brew/the-morning-brew-news-service.js';

export default class ProvidersCacheService {
    constructor() {
        const configFilePath = path.resolve(__dirname, '../common/config.json');
        if (fs.existsSync(configFilePath)) {
            this.config = require(configFilePath);
        } else {
            this.config = {
                cityName: process.env.CITY_NAME,
                suppliersKeyword: process.env.SUPPLIERS_KEYWORD
            };
        }
    }

    news(cache) {
        const newsDataPromises = [
            weatherService.getSummary(this.config.cityName),
            airPollutionService.getSummary(),
            heatingSupplyService.get(this.config.suppliersKeyword),
            waterSupplyService.get(this.config.suppliersKeyword),
            googleNewsService.get(),
            cnnNewsService.get(),
            newYorkTimesNewsService.get(),
            bbcNewsService.get(),
            reutersNewsService.get(),
            guardianNewsService.get()
        ];

        const techPromises = [
            theVergeNewsService.get(),
            techCrunchNewsService.get(),
            techRadarNewsService.get(),
            engadgetNewsService.get()
        ];

        const programmingPromises = [
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
    }

    weather(cache) {
        weatherService.getDetailedForecast(this.config.cityName).then((data) => {
            cache.weather = data.mappedData;
            cache.weatherRaw = data.rawData;
        }).catch((error) => {
            console.error(error);
        });
    }
}
