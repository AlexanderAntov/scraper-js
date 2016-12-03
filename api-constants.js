module.exports = function () {
    var fs = require('fs'),
        tokensFilePath = './tokens.json',
        tokens;
    //used to retrieve the local config file
    if (fs.existsSync(tokensFilePath)) {
        tokens = JSON.parse(fs.readFileSync(tokensFilePath, 'utf8'));
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
            host: 'api.nytimes.com',
            path: '/svc/topstories/v2/home.json?api-key={0}',
            token: tokens.newYorkTimes
        },
        theGuardian: {
            isHttps: true,
            host: 'content.guardianapis.com',
            path: '/search?api-key={0}&q=NOT%20sport&show-blocks=body',
            token: tokens.theGuardian
        },
        weatherApi: {
            isHttps: false,
            host: 'api.openweathermap.org',
            path: '/data/2.5/forecast?q={0}&units=metric&mode=json&cnt=40&appid={1}',
            token: tokens.weatherApi
        },
        bbc: null,
        googleNews: null,
        reuters: null,
        independent: null,
        dailyMail: null,
        skyNews: null,
        watterSupply: null,
        heatingSupply: null,
        facebookFeed: null
    };
};