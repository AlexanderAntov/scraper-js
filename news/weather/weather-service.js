module.exports = function () {
    var apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')(),
        weatherIconsConst = require('./weather-icons-const.js'),
        weatherForecastUrl = 'http://sinoptik.bg';

    return {
        getSummary: function (cityName) {
            var options = httpService.clone(apiConstants.weatherApi);
            options.path = options.path
                .replace('{0}', cityName)
                .replace('{1}', 5)
                .replace('{2}', options.token);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var forecastDescription = '',
                    weatherCode,
                    currentDate = new Date();

                data.list.forEach(processWeatherDataItem);

                return [
                    {
                        title: 'Weather forecast summarized',
                        shortInfo: forecastDescription,
                        url: weatherForecastUrl,
                        image: (process.env.APP_URL || '') + weatherIconsConst[weatherCode],
                        dateTime: new Date().toDateString()
                    }
                ];

                function processWeatherDataItem(weatherDataItem) {
                    if (!weatherCode) {
                        weatherCode = weatherDataItem.weather[0].id;
                    }
                    forecastDescription += getCurrentDayDescription(weatherDataItem);
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                function getCurrentDayDescription(weatherDataItem) {
                    var itemSeparator = '  ',
                        lineSeparator = '\r\n';
                    return formatDate(currentDate) + itemSeparator +
                        weatherDataItem.weather[0].description + itemSeparator +
                        Math.round(weatherDataItem.temp.min).toString() + ' / ' +
                        Math.round(weatherDataItem.temp.max).toString() +
                        lineSeparator;
                }
            }
        },
        getDetailedForecast: function (cityName) {
            var options = httpService.clone(apiConstants.weatherApi);
            options.path = options.path
                .replace('{0}', cityName)
                .replace('{1}', 16)
                .replace('{2}', options.token);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var currentDate = new Date(),
                    weatherModelsList = [];

                data.list.forEach(processWeatherDataItem);

                return weatherModelsList;

                function processWeatherDataItem(weatherDataItem) {
                    weatherModelsList.push({
                        title: 'Weather ' + formatDate(currentDate),
                        shortInfo: getCurrentDayDescription(weatherDataItem),
                        url: weatherForecastUrl,
                        image: process.env.APP_URL + weatherIconsConst[weatherDataItem.weather[0].id],
                        dateTime: ''
                    });

                    currentDate.setDate(currentDate.getDate() + 1);
                }

                function getCurrentDayDescription(weatherDataItem) {
                    var itemSeparator = '  ',
                        lineSeparator = '\r\n';
                    return weatherDataItem.weather[0].description + itemSeparator +
                        Math.round(weatherDataItem.temp.min).toString() + ' / ' +
                        Math.round(weatherDataItem.temp.max).toString() + lineSeparator +
                        'clouds %: ' + weatherDataItem.clouds + lineSeparator +
                        'wind: ' + weatherDataItem.speed + lineSeparator +
                        'humidity %: ' + weatherDataItem.humidity;
                }
            }
        }
    };

    function formatDate(dateValue) {
        return dateValue.getDate().toString() + '-' + (dateValue.getMonth() + 1).toString();
    }
};
