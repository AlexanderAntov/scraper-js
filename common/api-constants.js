module.exports = function () {
    var fs = require('fs'),
        tokensFilePath = require('path').resolve(__dirname, 'tokens.json'),
        tokens;
    //used to retrieve the local config file
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
        bbc: null,
        reuters: null,
        independent: null,
        dailyMail: null,
        skyNews: null,
        watterSupply: null,
        facebookFeed: null
    };
};