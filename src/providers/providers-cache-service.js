import * as fs from 'fs';
import * as path from 'path';
import { HttpService } from '../common/http-service.js';
import { NewYorkTimesNewsService } from './news/new-york-times/new-york-times-news-service.js';
import { BtaNewsService } from './news/bta/bta-news-service.js';
import { CnnNewsService } from './news/cnn/cnn-news-service.js.js';
import { BbcNewsService } from './news/bbc/bbc-news-service.js';
import { ReutersNewsService } from './news/reuters/reuters-news-service.js';
import { GuardianNewsService } from './news/guardian/guardian-news-service.js';
import { HeatingSupplyService } from './utilities/heating-supply/heating-supply-service.js';
import { WaterSupplyService } from './utilities/water-supply/water-supply-service.js';
import { AirPollutionService } from './weather/air-pollution-service.js';
import { WeatherService } from './weather/weather-service.js';
import { TechCrunchNewsService } from './news/tech-and-science/techcrunch/techcrunch-news-service.js';
import { VergeNewsService } from './news/tech-and-science/verge/verge-news-service.js';
import { TechRadarNewsService } from './news/tech-and-science/techradar/techradar-news-service.js';
import { EngadgetNewsService } from './news/tech-and-science/engadget/engadget-news-service.js';
import { MorningBrewNewsService } from './news/programming/morning-brew/morning-brew-news-service.js';

export class ProvidersCacheService {
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
            WeatherService.getSummary(this.config.cityName),
            AirPollutionService.getSummary(),
            HeatingSupplyService.get(this.config.suppliersKeyword),
            WaterSupplyService.get(this.config.suppliersKeyword),
            BtaNewsService.get(),
            NewYorkTimesNewsService.get(),
            CnnNewsService.get(),
            BbcNewsService.get(),
            ReutersNewsService.get(),
            GuardianNewsService.get()
        ];

        const techPromises = [
            VergeNewsService.get(),
            TechCrunchNewsService.get(),
            TechRadarNewsService.get(),
            EngadgetNewsService.get()
        ];

        const programmingPromises = [
            MorningBrewNewsService.get()
        ];

        return Promise.all(newsDataPromises).then((resolves) =>  {
            return HttpService.flattenPromiseAllResolve(resolves, (list) => {
                cache.news = list;
            });
        }).then(() => {
            return Promise.all(techPromises).then((resolves) => {
                return HttpService.flattenPromiseAllResolve(resolves, (list) => {
                    cache.techAndScience = list;
                });
            })
        }).then(() => {
            return Promise.all(programmingPromises).then((resolves) => {
                return HttpService.flattenPromiseAllResolve(resolves, (list) => {
                    cache.programming = list;
                });
            })
        }).catch((error) => {
            console.error(error);
        });
    }

    weather(cache) {
        WeatherService.getDetailedForecast(this.config.cityName).then((data) => {
            cache.weather = data.mappedData;
            cache.weatherRaw = data.rawData;
        }).catch((error) => {
            console.error(error);
        });
    }
}
