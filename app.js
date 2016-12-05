var express = require('express'),
    schedule = require('node-schedule'),
    http = require('http'),
    httpServices = require('./http-services.js')(),
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

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

//heroku
if (process.env.PORT) {
    app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
} else { //openshift
    http.createServer(app).listen(app.get('port'), app.get('ip'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}


function setUpSchedule() {
    schedule.scheduleJob({ hour: 6 }, setUpCache);
    schedule.scheduleJob({ hour: 17 }, setUpCache);
}

function setUpCache() {
    cacheNews();
    //cacheWeather();

    function cacheNews() {
        var newsDataPromises = [
            httpServices.newYorkTimes(),
            httpServices.theGuardian()
        ];

        Promise.all(newsDataPromises).then(function (dataModelLists) {
            var newsModelsList = [];
            dataModelLists.forEach(function (dataModelList) {
                newsModelsList = newsModelsList.concat(dataModelList);
            });
            dataCache.news = newsModelsList;
        });
    }

    function cacheWeather() {
        httpServices.weatherData('Sofia').then(function (dataModelLists) {
            var weatherModelsList = [];
            dataModelLists.forEach(function (dataModelList) {
                weatherModelsList = weatherModelsList.concat(dataModelList);
            });
            dataCache.weather = weatherModelsList;
        });
    }
}
