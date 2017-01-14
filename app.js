var _ = require('lodash'),
    express = require('express'),
    schedule = require('node-schedule'),
    cacheService = require('./common/cache-service.js')(),
    app = express(),
    dataCache = {
        news: null,
        weather: null
    };

setUpSchedule();

app.get('/', function (req, res) {
    res.send('Welcome to Scraper API <br />' + 'Server time: ' + new Date().toString());
});

app.use('/static', express.static('resources'));

app.get('/news', function (req, res) {
    res.send(dataCache.news);
});

app.get('/news/:provider', function (req, res) {
    if (req.params.provider) {
        res.send(_.filter(dataCache.news, { provider: req.params.provider }));
    } else {
        res.send(dataCache.news);
    }
});

app.get('/weather', function (req, res) {
    res.send(dataCache.weather);
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
