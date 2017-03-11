var _ = require('lodash'),
    express = require('express'),
    schedule = require('node-schedule'),
    cacheService = require('./common/cache-service.js')(),
    weatherService = require('./news/weather/weather-service.js')()
    app = express(),
    dataCache = {
        news: null,
        weather: null,
        weatherRaw: null
    };

setUpSchedule();

app.use('/static', express.static('resources'));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});

app.get('/', function (req, res) {
    res.send('Welcome to Scraper API <br />' + 'Server time: ' + new Date().toString());
});

app.get('/news', function (req, res) {
    var responseNewsList = _.cloneDeep(dataCache.news);
    if (!_.isUndefined(req.query.skip) && !_.isUndefined(req.query.take)) {
        responseNewsList = _.take(_.drop(responseNewsList, req.query.skip), req.query.take);
    }
    if (!req.query.images) {
        responseNewsList = getListNoImages(responseNewsList);
    }
    res.send(responseNewsList);
});

app.get('/news/:provider', function (req, res) {
    var responseNewsList = _.cloneDeep(dataCache.news);
    if (req.params.provider) {
        responseNewsList = _.filter(dataCache.news, { provider: req.params.provider });
    }
    if (!req.query.images) {
        responseNewsList = getListNoImages(responseNewsList);
    }
    res.send(responseNewsList);
});

app.get('/weather', function (req, res) {
    res.send(dataCache.weather);
});

app.get('/weather-raw', function (req, res) {
    if (req.query.city) {
        weatherService.getDetailedForecast(req.query.city).then(function (weatherData) {
            res.send(weatherData.rawData);
        });
    } else {
        res.send(dataCache.weatherRaw);
    }
});

app.get('/reset-cache', function (req, res) {
    setUpCache();
    res.send(true);
});

app.set('port', process.env.PORT || 8080);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function setUpSchedule() {
    var serverTimeOffset = -(new Date().getTimezoneOffset() / 60 + 2);
    schedule.scheduleJob({ hour: 7 + serverTimeOffset }, setUpCache);
    schedule.scheduleJob({ hour: 17 + serverTimeOffset }, setUpCache);
}

function setUpCache() {
    cacheService.news(dataCache);
    cacheService.weather(dataCache);
}

function getListNoImages(list) {
    return _.map(list, function (item) {
        if (item.provider) {
            item.image = null;
        }
        return item;
    });
}
