import { cloneDeep, take, drop, filter, find } from 'lodash';
import providersCacheService from './providers/providers-cache-service.js';
import providersScrapingService from './providers/providers-scraping-service.js';
import weatherService from './providers/weather/weather-service.js';
import tfIdfModifierService from './transformers/keywords/tf-idf/tf-idf-modifier-service.js';
import httpService from './common/http-service.js';
import apiConstants from './common/api-constants.js';
import apiProvidersConst from './common/api-providers-const.js';

export default class ApiService {
    constructor() {
        this.cache = {
            news: [],
            techAndScience: [],
            programming: [],
            weather: [],
            weatherRaw: [],
            newsKeywords: []
        };
    }

    setUpCache() {
        return providersCacheService.news(this.cache).then((result) => {
            providersCacheService.weather(this.cache);
            return result;
        });
    }

    setUpCacheWithKeywords() {
        this.setUpCache().then(() => {
            const tfIdfModifier = new tfIdfModifierService();
            return tfIdfModifier.sendMail(tfIdfModifier.get(this.cache.news, this.cache));
        });
    }

    home(req, res) {
        res.send('Welcome to Scraper API <br />' + 'Server time: ' + new Date().toString());
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
        let id, model;
        if (req.params.id) {
            id = parseInt(req.params.id);
            model = find(this.cache.news, { id: id });
        }

        providersScrapingService.scrape(model).then((data) => {
            res.send(data);
        });
    }

    weather(req, res) {
        res.send(this.cache.weather);
    }

    weatherRaw(req, res) {
        if (req.query.city) {
            new weatherService().getDetailedForecast(req.query.city).then((weatherData) => {
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
                    const tfIdfModifier = new tfIdfModifierService();
                    return tfIdfModifier.sendMail(tfIdfModifier.get(this.cache.news, this.cache));
                });
            }
            result.then(() => {
                this.cache.news.forEach((model) => {
                    model.info = httpService.trim(model.info);
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