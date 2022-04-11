import * as fs from 'fs';
import * as path from 'path';

export class ProviderConfig {
    public isHttps: boolean = false;
    public isApi: boolean = false;
    public host: string = '';
    public path: string = '';

    constructor({ isHttps, isApi, host, path }: { isHttps: boolean, isApi: boolean, host: string, path: string }) {
        this.isHttps = isHttps;
        this.isApi = isApi;
        this.host = host;
        this.path = path;
    }
};

class ApiConstants {
    private tokens: any;
    private config: any;
    public apiUrl: string;
    public webAppUrl: string;
    public authToken: string;
    public newYorkTimes: ProviderConfig;
    public bta: ProviderConfig;
    public cnn: ProviderConfig;
    public bbc: ProviderConfig;
    public theGuardian: ProviderConfig;
    public reuters: ProviderConfig;
    public weather: ProviderConfig;
    public airPollution: ProviderConfig;
    public verge: ProviderConfig;
    public techCrunch: ProviderConfig;
    public techRadar: ProviderConfig;
    public engadget: ProviderConfig;
    public emailConfig: any;

    constructor() {
        this.initTokens();
        this.initConfig();

        this.apiUrl = this.config.apiUrl;
        this.webAppUrl = this.config.webAppUrl;
        this.authToken = this.tokens.authToken;
        this.emailConfig = {
            username: this.tokens.emailUsername,
            password: this.tokens.emailPassword,
            receiver: this.tokens.emailReceiver
        };

        this.initProviderConfigs();
    }

    private initTokens(): void {
        const tokensFilePath = path.resolve(__dirname, 'tokens.json');

        if (fs.existsSync(tokensFilePath)) {
            this.tokens = require(tokensFilePath);
        } else {
            this.tokens = {
                authToken: process.env.AUTH_TOKEN,
                newYorkTimes: process.env.NEW_YORK_TIMES_TOKEN,
                weatherApi: process.env.WEATHER_API_TOKEN,
                airPollution: process.env.AIR_POLLUTION_TOKEN,
                newsApi: process.env.NEWS_API,
                emailUsername: process.env.EMAIL_USER,
                emailPassword: process.env.EMAIL_PASS,
                emailReceiver: process.env.EMAIL_RECEIVER
            };
        }
    }

    private initConfig(): void {
        const configFilePath = path.resolve(__dirname, 'config.json');

        if (fs.existsSync(configFilePath)) {
            this.config = require(configFilePath);
        } else {
            this.config = {
                apiUrl: process.env.APP_URL,
                webAppUrl: process.env.WEB_APP_URL
            };
        }
    }

    private initProviderConfigs(): void {
        this.weather = new ProviderConfig({
            isHttps: false,
            isApi: true,
            host: 'api.openweathermap.org',
            path: `/data/2.5/forecast/daily?q={0}&units=metric&mode=json&cnt={1}&appid=${this.tokens.weatherApi}`
        });
        this.airPollution = new ProviderConfig({
            isHttps: true,
            isApi: true,
            host: 'airtube.info',
            path: `/api/get_data_history.php?location_id=${this.tokens.airPollution}&interval=1d&period=3d`
        });
        this.newYorkTimes = new ProviderConfig({
            isHttps: true,
            isApi: true,
            host: 'api.nytimes.com',
            path: `/svc/topstories/v2/home.json?api-key=${this.tokens.newYorkTimes}`
        });
        this.bbc = new ProviderConfig({
            isHttps: false,
            isApi: false,
            host: 'feeds.bbci.co.uk',
            path: '/news/rss.xml'
        });
        this.cnn = new ProviderConfig({
            isHttps: false,
            isApi: false,
            host: 'rss.cnn.com',
            path: '/rss/edition.rss'
        });
        this.theGuardian = new ProviderConfig({
            isHttps: true,
            isApi: true,
            host: 'content.guardianapis.com',
            path: `/search?api-key=${this.tokens.theGuardian}&from-date=${new Date().toISOString().split('T')[0]}&order-by=relevance&section=world`
        });
        this.reuters = new ProviderConfig({
            isHttps: true,
            isApi: false,
            host: 'news.google.com',
            path: '/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US'
        });
        this.bta = new ProviderConfig({
            isApi: false,
            isHttps: false,
            host: 'www.bta.bg',
            path: '/bg/rss/free'
        });
        this.verge = new ProviderConfig({
            isHttps: true,
            isApi: true,
            host: 'newsapi.org',
            path: `/v2/top-headlines?sources=the-verge&apiKey=${this.tokens.newsApi}`
        });
        this.techCrunch = new ProviderConfig({
            isHttps: false,
            isApi: false,
            host: 'feeds.feedburner.com',
            path: '/TechCrunch.xml'
        });
        this.techRadar = new ProviderConfig({
            isHttps: true,
            isApi: false,
            host: 'www.techradar.com',
            path: '/rss'
        });
        this.engadget = new ProviderConfig({
            isHttps: true,
            isApi: false,
            host: 'www.engadget.com',
            path: '/rss.xml'
        });
    }
}

export const apiConstants = new ApiConstants();
