import * as fs from 'fs';
import path from 'path';

function apiConstants() {
    const tokensFilePath = require('path').resolve(__dirname, 'tokens.json');
    let tokens;
    if (fs.existsSync(tokensFilePath)) {
        tokens = require(tokensFilePath);
    } else {
        tokens = {
            newYorkTimes: process.env.NEW_YORK_TIMES_TOKEN,
            theGuardian: process.env.THE_GUARDIAN_TOKEN,
            weatherApi: process.env.WEATHER_API_TOKEN
        };
    }

    return {
        newYorkTimes: {
            isHttps: true,
            isApi: true,
            host: 'api.nytimes.com',
            path: '/svc/topstories/v2/home.json?api-key={0}',
            token: tokens.newYorkTimes
        },
        theGuardian: {
            isHttps: true,
            isApi: true,
            host: 'content.guardianapis.com',
            path: '/search?api-key={0}&q=NOT%20sport&show-blocks=body',
            token: tokens.theGuardian
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
        heatingSupply: {
            isHttps: false,
            isApi: false,
            host: 'toplo.bg',
            path: '/all-breakdowns',
            token: null
        },
        waterSupply: {
            isHttps: false,
            isApi: false,
            host: 'obrazcov.bg',
            path: '/%D0%BA%D1%8A%D0%B4%D0%B5-%D0%B2-%D1%81%D0%BE%D1%84%D0%B8%D1%8F-%D0%BD%D1%8F%D0%BC%D0%B0-%D0%B4%D0%B0-%D0%B8%D0%BC%D0%B0-%D0%B2%D0%BE%D0%B4%D0%B0-%D0%B4%D0%BD%D0%B5%D1%81/',
            token: null
        },
        scienceMag: {
            isHttps: false,
            isApi: false,
            host: 'science.sciencemag.org',
            path: '/rss/current.xml',
            token: null
        },
        techCrunch: {
            isHttps: false,
            isApi: false,
            host: 'feeds.feedburner.com',
            path: '/TechCrunch.xml',
            token: null
        },
        reuters: null,
        independent: null,
        dailyMail: null,
        skyNews: null,
        facebookFeed: null
    };
}

module.exports = apiConstants();