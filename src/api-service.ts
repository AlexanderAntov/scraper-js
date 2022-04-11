import * as fs from 'fs';
import { ProvidersCacheService } from './providers/providers-cache-service';
import { ProvidersScrapingService } from './providers/providers-scraping-service';
import { WeatherService } from './providers/weather/weather-service.js';
import { TfIdfService } from './transformers/keywords/tf-idf/tf-idf-service.js';
import { SummarizationService } from './transformers/summarization/summarization-service';
import { flKnReadabilityService } from './transformers/readability/fl-kn-readability-service';
import { NewsModel } from './common/news-model';
import { NewsCache } from './common/news-cache';
import { Request, Response } from 'express';
import { apiConstants } from './common/api-constants.js';
import { apiProvidersConst } from './common/api-providers-const.js';
import { cloneDeep, take, drop, filter, find } from 'lodash';
import { TfIdfItem } from './transformers/keywords/tf-idf/tf-idf-item-model';

export class ApiService {
    private cache: NewsCache;
    private weatherService: WeatherService;
    private summarizationService: SummarizationService;
    private tfIdfService: TfIdfService;
    private providersCacheService: ProvidersCacheService;
    private providersScrapingService: ProvidersScrapingService;

    constructor() {
        this.cache = new NewsCache();
        this.weatherService = new WeatherService();
        this.summarizationService = new SummarizationService();
        this.tfIdfService = new TfIdfService();
        this.providersCacheService = new ProvidersCacheService();
    }

    async setUpCache(saveCache: boolean): Promise<NewsModel[]> {
        const result = await this.providersCacheService.news(this.cache);
        this.providersCacheService.weather(this.cache);
        if (saveCache) {
            const fileName = this._getCacheFileName(new Date());
            fs.writeFileSync(`${__dirname}/../caches/${fileName}`, JSON.stringify(this.cache));
        }
        return result;
    }

    _getCacheFileName(dateTime: Date): string {
        const date: string = dateTime.getDate().toString();
        const month: string = (dateTime.getMonth() + 1).toString();
        const year: string = dateTime.getFullYear().toString();
        return `${date}${month}${year}-cache.json`;
    }

    async setUpCacheWithKeywords() {
        await this.setUpCache(false);
        const keywords: TfIdfItem[] = this.tfIdfService.get(this.cache.news, this.cache);
        return this.tfIdfService.sendMail(keywords);
    }

    home(req: Request, res: Response) {
        res.send(`Welcome to Scraper API <br /> Server time: ${new Date().toString()}`);
    }

    news(req: Request, res: Response) {
        let responseNewsList: NewsModel[] = cloneDeep(this.cache.news);
        if (req.query.skip !== undefined && req.query.take !== undefined) {
            const skipCount: number = Number.parseInt(req.query.skip as string);
            const takeCount: number = Number.parseInt(req.query.take as string);
            responseNewsList = take(drop(responseNewsList, skipCount), takeCount);
        }
        if (!req.query.images) {
            responseNewsList = this._getListNoImages(responseNewsList);
        }
        res.send(responseNewsList);
    }

    newsByProvider(req: Request, res: Response) {
        let responseNewsList: NewsModel[] = cloneDeep(this.cache.news);
        if (req.params.provider) {
            let targetProvider = null;
            for (let provider in apiProvidersConst) {
                if (apiProvidersConst.hasOwnProperty(provider) && 
                    apiProvidersConst[provider].filter === req.params.provider) {
                        targetProvider = apiProvidersConst[provider];
                 }
            }

            if (targetProvider) {
                responseNewsList = filter(this.cache.news, { provider: targetProvider.id });
            } else {
                responseNewsList = [];
            }
        }
        if (!req.query.images) {
            responseNewsList = this._getListNoImages(responseNewsList);
        }
        res.send(responseNewsList);
    }

    newsKeywords(req: Request, res: Response) {
        res.send(this.cache.newsKeywords);
    }

    newsProviders(req: Request, res: Response) {
        res.send(apiProvidersConst);
    }

    techAndScience(req: Request, res: Response) {
        let responseNewsList = cloneDeep(this.cache.techAndScience);
        if (!req.query.images) {
            responseNewsList = this._getListNoImages(responseNewsList);
        }
        res.send(responseNewsList);
    }

    scrape(req: Request, res: Response) {
        let id;
        let model: NewsModel | undefined;

        if (req.params.id) {
            id = parseInt(req.params.id);
            const cachedModel = find(this.cache.news, { id: id });

            if (cachedModel) {
                model = cachedModel;
            }
        }

        if (model) {
            this.providersScrapingService.scrape(model).then((data) => {
                res.send({
                    summary: this.summarizationService.summarize(model?.title, data),
                    text: data,
                    keywords: this.tfIdfService.get([model]).map((wordData: TfIdfItem) => wordData.word),
                    readabilityScore: flKnReadabilityService.getScore(model?.info)
                });
            });
        }
    }

    weather(req: Request, res: Response) {
        res.send(this.cache.weather);
    }

    weatherRaw(req: Request, res: Response) {
        if (req.query.city) {
            this.weatherService.getDetailedForecast(req.query.city as string).then((weatherData) => {
                res.send(weatherData.rawData);
            });
        } else {
            res.send(this.cache.weatherRaw);
        }
    }

    async resetCache(req: Request, res: Response) {
        if (req.query.token === apiConstants.authToken) {
            await this.setUpCache(false);
            if (req.query.keywords) {
                const list: TfIdfItem[] = this.tfIdfService.get(this.cache.news, this.cache);
                this.tfIdfService.sendMail(list);
            }
            res.send(true);
        } else {
            res.send(false);
        }
    }

    _getListNoImages(list: NewsModel[]) {
        return list.map((item) => {
            if (item.provider) {
                item.image = '';
            }
            return item;
        });
    }
}