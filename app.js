var express = require('express'),
    schedule = require('node-schedule'),
    cacheService = require('./cache-service.js')(),
    app = express(),
    dataCache = {
        news: null,
        weather: null
    };

setUpSchedule();

app.get('/', function (req, res) {
    res.send('Welcome to Scraper API\n');
});

//news
app.get('/news', function (req, res) {
    res.send(dataCache.news);
});

//weather
app.get('/weather', function (req, res) {
    res.send(dataCache.weather);
});

//reset-cache
app.get('/reset-cache', function (req, res) {
    setUpCache();
    res.send(true);
});

app.set('port', process.env.PORT || 8080);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function setUpSchedule() {
    schedule.scheduleJob({ hour: 7 }, setUpCache);
    schedule.scheduleJob({ hour: 17 }, setUpCache);
}

function setUpCache() {
    cacheService.news(dataCache);
    //cacheService.weather(dataCache, 'Sofia');
}
