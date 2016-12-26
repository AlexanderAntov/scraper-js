module.exports = function () {
    var apiConstants = require('../../common/api-constants.js')(),
        httpService = require('../../common/http-service.js')();

    return {
        get: function (cityName) {
            var options = httpService.clone(apiConstants.weatherApi);
            options.path = options.path
                .replace('{0}', cityName)
                .replace('{1}', options.token);
            return httpService.performGetRequest(options, dataTransformer);

            function dataTransformer(data) {
                var forecastDescription = '',
                    currentDate,
                    currentDateMin,
                    currentDateMax,
                    currentDateForecasts = [],
                    tempDate;

                data.list.forEach(processWeatherDataItem);

                return [
                    {
                        title: 'Weather forecast summarized',
                        shortInfo: forecastDescription,
                        url: 'http://sinoptik.bg/sofia-bulgaria-100727011?auto',
                        image: null,
                        dateTime: new Date().toDateString()
                    }
                ];

                function processWeatherDataItem(weatherDataItem) {
                    tempDate = weatherDataItem.dt_txt.split(' ')[0];
                    currentDateForecasts.push(weatherDataItem.weather[0].description);

                    if (tempDate !== currentDate) {
                        if (currentDate) {
                            forecastDescription += getCurrentDayDescription();
                            currentDateForecasts = [];
                        }

                        currentDate = tempDate;
                        currentDateMin = weatherDataItem.main.temp_min;
                        currentDateMax = weatherDataItem.main.temp_max;
                    }

                    if (weatherDataItem.main.temp_min < currentDateMin) {
                        currentDateMin = weatherDataItem.main.temp_min;
                    }
                    if (weatherDataItem.main.temp_max > currentDateMax) {
                        currentDateMax = weatherDataItem.main.temp_max;
                    }
                }

                function getCurrentDayDescription() {
                    var itemSeparator = '  ',
                        lineSeparator = '\r\n';
                    return formatDate(currentDate) + itemSeparator +
                        getAverageDescription(currentDateForecasts) + itemSeparator +
                        Math.round(currentDateMin).toString() + ' / ' +
                        Math.round(currentDateMax).toString() +
                        lineSeparator;

                    function formatDate(value) {
                        var splittedDate = value.split('-').reverse();
                        return splittedDate[0] + '-' + splittedDate[1];
                    }
                }

                function getAverageDescription(weatherDescriptions) {
                    var occurenceMap = {},
                        maxOccurrences = 0,
                        mostOftenDescription;
                    weatherDescriptions.forEach(function (description) {
                        if (!occurenceMap[description]) {
                            occurenceMap[description] = 1;
                        } else {
                            occurenceMap[description]++;
                        }
                    });

                    for (var description in occurenceMap) {
                        if (occurenceMap.hasOwnProperty(description) && occurenceMap[description] > maxOccurrences) {
                            maxOccurrences = occurenceMap[description];
                            mostOftenDescription = description;
                        }
                    }

                    return mostOftenDescription;
                }
            }
        }
    };
};
