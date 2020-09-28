import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../common/common.js';
import { weatherIconsConst } from './weather-icons-const.js';
import { WeatherSummaryService } from '../../transformers/weather-summary/weather-summary-service.js';
import { cloneDeep } from 'lodash';

export class WeatherService {
    static getSummary(cityName) {
        let options = cloneDeep(apiConstants.weatherApi);
        options.path = options.path
            .replace('{0}', cityName)
            .replace('{1}', 5);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const hasResults = data && data.list;
            if (!hasResults) {
                return [];
            }

            const currentDate = new Date();
            let forecastDescription = '';
            let weatherCode;

            data.list.forEach(processWeatherDataItem);

            return [
                new NewsModel({
                    title: WeatherSummaryService.get(data.list),
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
                const itemSeparator = '  ';
                const lineSeparator = '\r\n';

                return formatDate(currentDate) + itemSeparator +
                    weatherDataItem.weather[0].description + itemSeparator +
                    Math.round(weatherDataItem.temp.min).toString() + ' / ' +
                    Math.round(weatherDataItem.temp.max).toString() + lineSeparator;

                function formatDate(dateValue) {
                    return `${dateValue.getDate().toString()}-${(dateValue.getMonth() + 1).toString()}`;
                }
            }
        }
    }

    static getDetailedForecast(cityName) {
        let options = cloneDeep(apiConstants.weatherApi);
        options.path = options.path
            .replace('{0}', cityName)
            .replace('{1}', 16);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            const hasResults = data && data.list;
            if (!hasResults) {
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
                weatherModelsList.push(new NewsModel({
                    title: `Weather ${formatDate(currentDate)}`,
                    info: getCurrentDayDescription(weatherDataItem),
                    url: `${apiConstants.webAppUrl}/index.html#!/weather-line-chart`,
                    image: apiConstants.apiUrl + weatherIconsConst[weatherDataItem.weather[0].id],
                    dateTime: '',
                    provider: apiProvidersConst.WEATHER.id
                }));

                currentDate.setDate(currentDate.getDate() + 1);

                function formatDate(dateValue) {
                    return `${dateValue.getDate().toString()}-${(dateValue.getMonth() + 1).toString()}`;
                }
            }

            function getCurrentDayDescription(weatherDataItem) {
                const itemSeparator = '  ';
                const lineSeparator = '\r\n';

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
