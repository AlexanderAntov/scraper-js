﻿import * as fs from 'fs';
import { ProvidersCacheService } from './providers/providers-cache-service.js';
import { ProvidersScrapingService } from './providers/providers-scraping-service.js';
import { WeatherService } from './providers/weather/weather-service.js';
import { TfIdfService } from './transformers/keywords/tf-idf/tf-idf-service.js';
import { NewsModelService } from './common/news-model-service.js';
import { SummarizationService } from './transformers/summarization/summarization-service.js';
import { FlKnReadabilityService } from './transformers/readability/fl-kn-readability-service.js';
import { apiConstants } from './common/api-constants.js';
import { apiProvidersConst } from './common/api-providers-const.js';
import { cloneDeep, take, drop, filter, find } from 'lodash';

export class ApiService {
    constructor() {
        this.cache = {
            news: [],
            techAndScience: [],
            programming: [],
            weather: [],
            weatherRaw: [],
            newsKeywords: []
        };
        this.weatherService = new WeatherService();
        this.summarizationService = new SummarizationService();
        this.tfIdfService = new TfIdfService();
        this.providersCacheService = new ProvidersCacheService();
    }

    setUpCache(saveCache) {
        return this.providersCacheService.news(this.cache).then((result) => {
            this.providersCacheService.weather(this.cache);

            if (saveCache) {
                const fileName = this._getCacheFileName(new Date());
                fs.writeFileSync(`${__dirname}/../caches/${fileName}`, JSON.stringify(this.cache))
            }

            return result;
        });
    }

    _getCacheFileName(dateTime) {
        const date = dateTime.getDate().toString();
        const month = (dateTime.getMonth() + 1).toString();
        const year = dateTime.getFullYear().toString();
        return `${date}${month}${year}-cache.json`;
    }

    setUpCacheWithKeywords() {
        this.setUpCache().then(() => {
            return this.tfIdfService.sendMail(this.tfIdfService.get(this.cache.news, this.cache));
        });
    }

    home(req, res) {
        res.send(`Welcome to Scraper API <br /> Server time: ${new Date().toString()}`);
    }

    news(req, res) {
        let responseNewsList = cloneDeep(this.cache.news);
        if (req.query.skip !== undefined && req.query.take !== undefined) {
            responseNewsList = take(drop(responseNewsList, req.query.skip), req.query.take);
        }
        if (!req.query.images) {
            responseNewsList = this._getListNoImages(responseNewsList);
        }
        res.send(responseNewsList);
    }

    newsByProvider(req, res) {
        let responseNewsList = cloneDeep(this.cache.news);
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

    newsKeywords(req, res) {
        res.send(this.cache.newsKeywords);
    }

    newsProviders(req, res) {
        res.send(apiProvidersConst);
    }

    techAndScience(req, res) {
        let responseNewsList = cloneDeep(this.cache.techAndScience);
        if (!req.query.images) {
            responseNewsList = this._getListNoImages(responseNewsList);
        }
        res.send(responseNewsList);
    }

    programming(req, res) {
        res.send(this.cache.programming);
    }

    scrape(req, res) {
        let id;
        let model;

        if (req.params.id) {
            id = parseInt(req.params.id);
            model = find(this.cache.news, { id: id });
        }

        ProvidersScrapingService.scrape(model).then((data) => {
            res.send({
                summary: this.summarizationService.summarize(model.title, data),
                text: data,
                keywords: this.tfIdfService.get([model]).map(wordData => wordData.word),
                readabilityScore: FlKnReadabilityService.getScore(model.info)
            });
        });
    }

    weather(req, res) {
        res.send(this.cache.weather);
    }

    weatherRaw(req, res) {
        if (req.query.city) {
            this.weatherService.getDetailedForecast(req.query.city).then((weatherData) => {
                res.send(weatherData.rawData);
            });
        } else {
            res.send(this.cache.weatherRaw);
        }
    }

    resetCache(req, res) {
        if (req.query.token === apiConstants.auth) {
            let result = this.setUpCache();
            if (req.query.keywords) {
                result = result.then(() => {
                    return this.tfIdfService.sendMail(this.tfIdfService.get(this.cache.news, this.cache));
                });
            }
            result.then(() => {
                this.cache.news.forEach((model) => {
                    model.info = NewsModelService.trim(model.info);
                });
            });
            res.send(true);
        } else {
            res.send(false);
        }
    }

    _getListNoImages(list) {
        return list.map((item) => {
            if (item.provider) {
                item.image = null;
            }
            return item;
        });
    }
}