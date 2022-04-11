import 'core-js';
import 'regenerator-runtime/runtime';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import schedule from 'node-schedule';
import { ApiService } from './api-service';

const app = express();
const apiService = new ApiService();

setUpSchedule();

app.use('/static', express.static(path.join(__dirname, 'resources')));
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});

app.get('/', (req: Request, res: Response) => apiService.home(req, res));
app.get('/news', (req: Request, res: Response) => apiService.news(req, res));
app.get('/news/:provider', (req: Request, res: Response) => apiService.newsByProvider(req, res));
app.get('/news-keywords', (req: Request, res: Response) => apiService.newsKeywords(req, res));
app.get('/news-providers', (req: Request, res: Response) => apiService.newsProviders(req, res));
app.get('/tech-and-science', (req: Request, res: Response) => apiService.techAndScience(req, res));
app.get('/scrape/:id', (req: Request, res: Response) => apiService.scrape(req, res));
app.get('/weather', (req: Request, res: Response) => apiService.weather(req, res));
app.get('/weather-raw', (req: Request, res: Response) => apiService.weatherRaw(req, res));
app.get('/reset-cache', (req: Request, res: Response) => apiService.resetCache(req, res));

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
});

function setUpSchedule() {
    const setUpCache = () => apiService.setUpCache(false);
    const setUpAndSaveCache = () => apiService.setUpCache(true);
    const setUpCacheWithKeywords = () => apiService.setUpCacheWithKeywords();

    schedule.scheduleJob({ hour: 7, minute: 0, second: 0 }, setUpCacheWithKeywords);
    schedule.scheduleJob({ hour: 9, minute: 0, second: 0 }, setUpAndSaveCache);
    schedule.scheduleJob({ hour: 13, minute: 0, second: 0 }, setUpCache);
    schedule.scheduleJob({ hour: 17, minute: 30, second: 0 }, setUpCacheWithKeywords);
    schedule.scheduleJob({ hour: 20, minute: 0, second: 0 }, setUpCache);
}
