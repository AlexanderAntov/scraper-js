import * as fs from 'fs';
import * as path from 'path';
import { flattenPromiseAllResolve } from '../common/http.utils.js';
import { NewsProviderBase } from './news-provider-base';
import { ISummaryProvider } from './isummary-provider';
import { NewYorkTimesNewsService } from './news/new-york-times/new-york-times-news-service';
import { BtaNewsService } from './news/bta/bta-news-service';
import { CnnNewsService } from './news/cnn/cnn-news-service';
import { BbcNewsService } from './news/bbc/bbc-news-service';
import { ReutersNewsService } from './news/reuters/reuters-news-service';
import { GuardianNewsService } from './news/guardian/guardian-news-service';
import { AirPollutionService } from './weather/air-pollution-service';
import { WeatherService } from './weather/weather-service';
import { TechCrunchNewsService } from './news/tech-and-science/techcrunch/techcrunch-news-service';
import { VergeNewsService } from './news/tech-and-science/verge/verge-news-service';
import { TechRadarNewsService } from './news/tech-and-science/techradar/techradar-news-service';
import { EngadgetNewsService } from './news/tech-and-science/engadget/engadget-news-service';
import { NewsModel } from '../common/news-model';
import { NewsCache } from '../common/news-cache.js';


export class ProvidersCacheService {
    private config: any;
    private weatherService: WeatherService;
    private airPollution: ISummaryProvider;
    private btaNews: NewsProviderBase;
    private newYorkTimes: NewsProviderBase;
    private ccnNews: NewsProviderBase;
    private bbcNews: NewsProviderBase;
    private guardian: NewsProviderBase;
    private reuters: NewsProviderBase;
    private verge: NewsProviderBase;
    private techCrunch: NewsProviderBase;
    private techRadar: NewsProviderBase;
    private engadget: NewsProviderBase;

    constructor() {
        const configFilePath = path.resolve(__dirname, '../common/config.json');
        if (fs.existsSync(configFilePath)) {
            this.config = require(configFilePath);
        } else {
            this.config = {
                cityName: process.env.CITY_NAME
            };
        }

        this.weatherService = new WeatherService(this.config.cityName);
        this.airPollution = new AirPollutionService();
        this.btaNews = new BtaNewsService();
        this.newYorkTimes = new NewYorkTimesNewsService();
        this.ccnNews = new CnnNewsService();
        this.bbcNews = new BbcNewsService();
        this.guardian = new GuardianNewsService();
        this.reuters = new ReutersNewsService();
        this.verge = new VergeNewsService();
        this.techCrunch = new TechCrunchNewsService();
        this.techRadar = new TechRadarNewsService();
        this.engadget = new EngadgetNewsService();
    }

    async news(cache: NewsCache): Promise<NewsModel[]> {
        const newsDataPromises = [
            this.weatherService.getSummary(),
            this.airPollution.getSummary(),
            this.btaNews.get(),
            this.newYorkTimes.get(),
            this.ccnNews.get(),
            this.bbcNews.get(),
            this.reuters.get(),
            this.guardian.get()
        ];

        const techPromises = [
            this.verge.get(),
            this.techCrunch.get()
            //this.techRadar.get(),
            //this.engadget.get()
        ];

        try {
            const newsResolves = await Promise.all(newsDataPromises);
            flattenPromiseAllResolve(newsResolves, (list: NewsModel[]) => {
                cache.news = list;
            });
            const techResolves = await Promise.all(techPromises);
            return flattenPromiseAllResolve(techResolves, (list: NewsModel[]) => {
                cache.techAndScience = list;
            });
        } catch (error) {
            console.error(error);
        }
    }

    async weather(cache: NewsCache): Promise<void> {
        try {
            const data = await this.weatherService.getDetailedForecast(this.config.cityName);
            cache.weather = data.mappedData;
            cache.weatherRaw = data.rawData;
        } catch (error) {
            console.error(error);
        }
    }
}
