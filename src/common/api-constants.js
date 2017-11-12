import * as fs from 'fs';
import path from 'path';

module.exports = (() => {
    const tokensFilePath = require('path').resolve(__dirname, 'tokens.json');
    let tokens;
    if (fs.existsSync(tokensFilePath)) {
        tokens = require(tokensFilePath);
    } else {
        tokens = {
            newYorkTimes: process.env.NEW_YORK_TIMES_TOKEN,
            weatherApi: process.env.WEATHER_API_TOKEN,
            theVerge: process.env.THE_VERGE,
            emailUsername: process.env.EMAIL_USER,
            emailPassword: process.env.EMAIL_PASS,
            emailReceiver: process.env.EMAIL_RECEIVER
        };
    }

    return {
        //http settings
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
            host: 'obrazcov.bg',
            path: '/%D0%BA%D1%8A%D0%B4%D0%B5-%D0%B2-%D1%81%D0%BE%D1%84%D0%B8%D1%8F-%D0%BD%D1%8F%D0%BC%D0%B0-%D0%B4%D0%B0-%D0%B8%D0%BC%D0%B0-%D0%B2%D0%BE%D0%B4%D0%B0-%D0%B4%D0%BD%D0%B5%D1%81/',
            token: null
        },
        theVerge: {
            isHttps: true,
            isApi: true,
            host: 'newsapi.org',
            path: '/v1/articles?source=the-verge&sort-by=top&apiKey={0}',
            token: tokens.theVerge
        },
        techCrunch: {
            isHttps: false,
            isApi: false,
            host: 'feeds.feedburner.com',
            path: '/TechCrunch.xml',
            token: null
        },
        //email settings
        email: {
            username: tokens.emailUsername,
            password: tokens.emailPassword,
            receiver: tokens.emailReceiver
        }
    };
})();