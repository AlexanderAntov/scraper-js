import * as _ from 'lodash';
import path from 'path';
import express from 'express';
import schedule from 'node-schedule';
import cacheService from './cache-service.js';
import weatherService from './providers/weather/weather-service.js';
import tfIdfModifierService from './transformers/keywords/tf-idf/tf-idf-modifier-service.js';
import httpService from './common/http-service.js';

let app = express(),
    dataCache = {
        news: null,
        techAndScience: null,
        weather: null,
        weatherRaw: null
    };

setUpSchedule();

app.use('/static', express.static(path.join(__dirname, 'resources')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to Scraper API <br />' + 'Server time: ' + new Date().toString());
});

app.get('/news', (req, res) => {
    let responseNewsList = _.cloneDeep(dataCache.news);
    if (!_.isUndefined(req.query.skip) && !_.isUndefined(req.query.take)) {
        responseNewsList = _.take(_.drop(responseNewsList, req.query.skip), req.query.take);
    }
    if (!req.query.images) {
        responseNewsList = getListNoImages(responseNewsList);
    }
    res.send(responseNewsList);
});

app.get('/news/:provider', (req, res) => {
    let responseNewsList = _.cloneDeep(dataCache.news);
    if (req.params.provider) {
        responseNewsList = _.filter(dataCache.news, { provider: req.params.provider });
    }
    if (!req.query.images) {
        responseNewsList = getListNoImages(responseNewsList);
    }
    res.send(responseNewsList);
});

app.get('/tech-and-science', (req, res) => {
    res.send(dataCache.techAndScience);
});

app.get('/weather', (req, res) => {
    res.send(dataCache.weather);
});

app.get('/weather-raw', (req, res) => {
    if (req.query.city) {
        new weatherService().getDetailedForecast(req.query.city).then((weatherData) => {
            res.send(weatherData.rawData);
        });
    } else {
        res.send(dataCache.weatherRaw);
    }
});

app.get('/reset-cache', (req, res) => {
    if (req.query.token === process.env.AUTH_TOKEN) {
        let result = setUpCache();
        if (req.query.keywords) {
            result = result.then(() => {
                return new tfIdfModifierService().get(dataCache.news, true);
            });
        }
        result.then(() => {
            dataCache.news.forEach((model) => {
                model.info = httpService.trim(model.info);
            });
        });
        res.send(true);
    } else {
        res.send(false);
    }
});

app.set('port', process.env.PORT || 8080);

app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});

function setUpSchedule() {
    let serverTimeOffset = -(new Date().getTimezoneOffset() / 60 + 2);
    schedule.scheduleJob({ hour: 7 + serverTimeOffset }, setUpCache);
    schedule.scheduleJob({ hour: 17 + serverTimeOffset }, setUpCache);
}

function setUpCache() {
    return cacheService.news(dataCache).then((result) => {
        cacheService.weather(dataCache);
        return result;
    });
}

function getListNoImages(list) {
    return _.map(list, function (item) {
        if (item.provider) {
            item.image = null;
        }
        return item;
    });
}
