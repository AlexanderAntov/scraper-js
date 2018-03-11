import { apiConstants, apiProvidersConst, httpService, newsModelFactory } from '../../common/common.js';
import weatherIconsConst from './weather-icons-const.js';
import weatherSummaryService from '../../transformers/weather-summary/weather-summary-service.js';

export default class Weather {
    static getSummary(cityName) {
        let options = httpService.clone(apiConstants.weatherApi);
        options.path = options.path
            .replace('{0}', cityName)
            .replace('{1}', 5)
            .replace('{2}', options.token);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            if (!data.list) {
                return [
                    newsModelFactory.get()
                ];
            }

            let forecastDescription = '',
                weatherCode,
                currentDate = new Date();

            data.list.forEach(processWeatherDataItem);

            return [
                newsModelFactory.get({
                    title: weatherSummaryService.get(data.list),
                    info: forecastDescription,
                    url: apiConstants.webAppUrl + '/index.html#!/weather-line-chart',
                    image: apiConstants.apiUrl + weatherIconsConst[weatherCode],
                    dateTime: new Date().toDateString(),
                    provider: apiProvidersConst.WEATHER.id
                })
            ];

            function processWeatherDataItem(weatherDataItem) {
                if (!weatherCode) {
                    weatherCode = weatherDataItem.weather[0].id;
                }
                forecastDescription += getCurrentDayDescription(weatherDataItem);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            function getCurrentDayDescription(weatherDataItem) {
                const itemSeparator = '  ',
                    lineSeparator = '\r\n';
                return formatDate(currentDate) + itemSeparator +
                    weatherDataItem.weather[0].description + itemSeparator +
                    Math.round(weatherDataItem.temp.min).toString() + ' / ' +
                    Math.round(weatherDataItem.temp.max).toString() +
                    lineSeparator;

                function formatDate(dateValue) {
                    return dateValue.getDate().toString() + '-' + (dateValue.getMonth() + 1).toString();
                }
            }
        }
    }

    static getDetailedForecast(cityName) {
        let options = httpService.clone(apiConstants.weatherApi);
        options.path = options.path
            .replace('{0}', cityName)
            .replace('{1}', 16)
            .replace('{2}', options.token);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            if (!data.list) {
                return {
                    rawData: null,
                    mappedData: null
                };
            }

            let currentDate = new Date(),
                weatherModelsList = [];

            data.list.forEach(processWeatherDataItem);

            return {
                rawData: data,
                mappedData: weatherModelsList
            };

            function processWeatherDataItem(weatherDataItem) {
                weatherModelsList.push(newsModelFactory.get({
                    title: 'Weather ' + formatDate(currentDate),
                    info: getCurrentDayDescription(weatherDataItem),
                    url: apiConstants.webAppUrl + '/index.html#!/weather-line-chart',
                    image: apiConstants.apiUrl + weatherIconsConst[weatherDataItem.weather[0].id],
                    dateTime: '',
                    provider: apiProvidersConst.WEATHER.id
                }));

                currentDate.setDate(currentDate.getDate() + 1);

                function formatDate(dateValue) {
                    return dateValue.getDate().toString() + '-' + (dateValue.getMonth() + 1).toString();
                }
            }

            function getCurrentDayDescription(weatherDataItem) {
                const itemSeparator = '  ',
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
}
