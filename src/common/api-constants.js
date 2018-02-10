import * as fs from 'fs';
import path from 'path';

module.exports = (() => {
    const tokensFilePath = require('path').resolve(__dirname, 'tokens.json');
    let tokens;
    if (fs.existsSync(tokensFilePath)) {
        tokens = require(tokensFilePath);
    } else {
        tokens = {
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

    return {
        //http settings
        auth: tokens.authToken,
        newYorkTimes: {
            isHttps: true,
            isApi: true,
            host: 'api.nytimes.com',
            path: '/svc/topstories/v2/home.json?api-key={0}',
            token: tokens.newYorkTimes
        },
        googleNews: {
            isApi: false,
            isHttps: true,
            host: 'news.google.com',
            path: '/news/rss?gl=BG&ned=bg_bg&hl=bg',
            token: null
        },
        cnn: {
            isHttps: false,
            isApi: false,
            host: 'rss.cnn.com',
            path: '/rss/edition.rss',
            token: null
        },
        bbc: {
            isHttps: false,
            isApi: false,
            host: 'feeds.bbci.co.uk',
            path: '/news/rss.xml',
            token: null
        },
        reuters: {
            isHttps: false,
            isApi: false,
            host: 'feeds.reuters.com',
            path: '/reuters/topNews',
            token: null
        },
        weatherApi: {
            isHttps: false,
            isApi: true,
            host: 'api.openweathermap.org',
            path: '/data/2.5/forecast/daily?q={0}&units=metric&mode=json&cnt={1}&appid={2}',
            token: tokens.weatherApi
        },
        airPollution: {
            isHttps: true,
            isApi: true,
            host: 'airtube.info',
            path: '/api/get_data_history.php?geohash={0}&period=3d&mode=table&interval=1d',
            token: tokens.airPollution
        },
        heatingSupply: {
            isHttps: false,
            isApi: false,
            host: 'toplo.bg',
            path: '/breakdowns',
            token: null
        },
        waterSupply: {
            isHttps: false,
            isApi: false,
            host: 'sofiyskavoda.bg',
            path: '/water_stops.aspx',
            token: null
        },
        theVerge: {
            isHttps: true,
            isApi: true,
            host: 'newsapi.org',
            path: '/v1/articles?source=the-verge&sort-by=top&apiKey={0}',
            token: tokens.newsApi
        },
        techCrunch: {
            isHttps: false,
            isApi: false,
            host: 'feeds.feedburner.com',
            path: '/TechCrunch.xml',
            token: null
        },
        techRadar: {
            isHttps: true,
            isApi: true,
            host: 'newsapi.org',
            path: '/v1/articles?source=techradar&sort-by=top&apiKey={0}',
            token: tokens.newsApi
        },
        //email settings
        email: {
            username: tokens.emailUsername,
            password: tokens.emailPassword,
            receiver: tokens.emailReceiver
        }
    };
})();
