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
            path: '/news?cf=all&hl=bg&pz=1&ned=bg_bg&output=rss',
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
        weatherApi: {
            isHttps: false,
            isApi: true,
            host: 'api.openweathermap.org',
            path: '/data/2.5/forecast/daily?q={0}&units=metric&mode=json&cnt={1}&appid={2}',
            token: tokens.weatherApi
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