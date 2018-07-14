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

app.get('/', (req, res) => apiService.home(req, res));
app.get('/news', (req, res) => apiService.news(req, res));
app.get('/news/:provider', (req, res) => apiService.newsByProvider(req, res));
app.get('/news-keywords', (req, res) => apiService.newsKeywords(req, res));
app.get('/news-providers', (req, res) => apiService.newsProviders(req, res));
app.get('/tech-and-science', (req, res) => apiService.techAndScience(req, res));
app.get('/programming', (req, res) => apiService.programming(req, res));
app.get('/scrape/:id', (req, res) => apiService.scrape(req, res));
app.get('/weather', (req, res) => apiService.weather(req, res));
app.get('/weather-raw', (req, res) => apiService.weatherRaw(req, res));
app.get('/reset-cache', (req, res) => apiService.resetCache(req, res));

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
});

function setUpSchedule() {
    const setUpCache = () => apiService.setUpCache(false),
        setUpAndSaveCache = () => apiService.setUpCache(true),
        setUpCacheWithKeywords = () => apiService.setUpCacheWithKeywords();
    schedule.scheduleJob({ hour: 7, minute: 0, second: 0 }, setUpCacheWithKeywords);
    schedule.scheduleJob({ hour: 9, minute: 0, second: 0 }, setUpAndSaveCache);
    schedule.scheduleJob({ hour: 13, minute: 0, second: 0 }, setUpCache);
    schedule.scheduleJob({ hour: 17, minute: 30, second: 0 }, setUpCacheWithKeywords);
    schedule.scheduleJob({ hour: 20, minute: 0, second: 0 }, setUpCache);
}
