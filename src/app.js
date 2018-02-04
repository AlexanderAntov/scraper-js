import path from 'path';
import express from 'express';
import schedule from 'node-schedule';
import ApiService from './api-service.js';

let app = express(),
    apiService = new ApiService();

setUpSchedule();

app.use('/static', express.static(path.join(__dirname, 'resources')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});

app.get('/', apiService.home);
app.get('/news', (req, res) => apiService.news(req, res));
app.get('/news/:provider', (req, res) => apiService.newsByProvider(req, res));
app.get('/news-keywords', (req, res) => apiService.newsKeywords(req, res));
app.get('/news-providers', (req, res) => apiService.newsProviders(req, res));
app.get('/tech-and-science', (req, res) => apiService.techAndScience(req, res));
app.get('/weather', (req, res) => apiService.weather(req, res));
app.get('/weather-raw', (req, res) => apiService.weatherRaw(req, res));
app.get('/reset-cache', (req, res) => apiService.resetCache(req, res));

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});

function setUpSchedule() {
    let serverTimeOffset = -(new Date().getTimezoneOffset() / 60 + 2);
    schedule.scheduleJob({ hour: 7 + serverTimeOffset }, (req, res) => apiService.setUpCache(req, res));
    schedule.scheduleJob({ hour: 17 + serverTimeOffset }, (req, res) => apiService.setUpCache(req, res));
}
