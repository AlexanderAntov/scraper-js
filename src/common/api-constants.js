import * as fs from 'fs';
import * as path from 'path';

class ApiConstants {
    constructor() {
        const tokensFilePath = path.resolve(__dirname, 'tokens.json'),
            configFilePath = path.resolve(__dirname, 'config.json');

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

        if (fs.existsSync(configFilePath)) {
            this.config = require(configFilePath);
        } else {
            this.config = {
                apiUrl: process.env.APP_URL,
                webAppUrl: process.env.WEB_APP_URL
            };
        }
    }

    get() {
        return {
            //http settings
            apiUrl: this.config.apiUrl,
            webAppUrl: this.config.webAppUrl, 
            auth: this.tokens.authToken,
            newYorkTimes: {
                isHttps: true,
                isApi: true,
                host: 'api.nytimes.com',
                path: `/svc/topstories/v2/home.json?api-key=${this.tokens.newYorkTimes}`,
            },
            googleNews: {
                isApi: false,
                isHttps: true,
                host: 'news.google.com',
                path: '/rss?hl=bg&gl=BG&ceid=BG:bg'
            },
            cnn: {
                isHttps: false,
                isApi: false,
                host: 'rss.cnn.com',
                path: '/rss/edition.rss'
            },
            bbc: {
                isHttps: false,
                isApi: false,
                host: 'feeds.bbci.co.uk',
                path: '/news/rss.xml'
            },
            theGuardian: {
                isHttps: true,
                isApi: true,
                host: 'content.guardianapis.com',
                path: `/search?api-key=${this.tokens.theGuardian}&from-date=${new Date().toISOString().split('T')[0]}&order-by=relevance&section=world`,
            },
            bta: {
                isHttps: false,
                isApi: false,
                host: 'feeds.bbci.co.uk',
                path: '/news/rss.xml'
            },
            reuters: {
                isHttps: false,
                isApi: false,
                host: 'feeds.reuters.com',
                path: '/reuters/topNews'
            },
            weatherApi: {
                isHttps: false,
                isApi: true,
                host: 'api.openweathermap.org',
                path: `/data/2.5/forecast/daily?q={0}&units=metric&mode=json&cnt={1}&appid=${this.tokens.weatherApi}`,
            },
            airPollution: {
                isHttps: true,
                isApi: true,
                host: 'airtube.info',
                path: `/api/get_data_history.php?location_id=${this.tokens.airPollution}&interval=1d&period=3d`,
            },
            heatingSupply: {
                isHttps: false,
                isApi: false,
                host: 'toplo.bg',
                path: '/breakdowns'
            },
            waterSupply: {
                isHttps: false,
                isApi: false,
                host: 'sofiyskavoda.bg',
                path: '/water_stops.aspx'
            },
            theVerge: {
                isHttps: true,
                isApi: true,
                host: 'newsapi.org',
                path: `/v2/top-headlines?sources=the-verge&apiKey=${this.tokens.newsApi}`
            },
            techCrunch: {
                isHttps: false,
                isApi: false,
                host: 'feeds.feedburner.com',
                path: '/TechCrunch.xml'
            },
            techRadar: {
                isHttps: true,
                isApi: true,
                host: 'newsapi.org',
                path: `/v2/top-headlines?sources=techradar&apiKey=${this.tokens.newsApi}`
            },
            engadget: {
                isHttps: false,
                isApi: false,
                host: 'www.engadget.com',
                path: '/rss.xml'
            },
            //programming
            medium: {
                isHttps: true,
                isApi: false,
                host: 'medium.com',
                path: '/feed/'
            },
            theMorningBrew: {
                isHttps: false,
                isApi: false,
                host: 'feeds.feedburner.com',
                path: '/ReflectivePerspective'
            },
            //email settings
            email: {
                username: this.tokens.emailUsername,
                password: this.tokens.emailPassword,
                receiver: this.tokens.emailReceiver
            }
        };
    }
}

export const apiConstants = new ApiConstants().get();
