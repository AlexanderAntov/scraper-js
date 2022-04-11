import { performGetRequest } from '../../common/http.utils';
import { WeatherSummaryService } from '../../transformers/weather-summary/weather-summary-service.js';
import { ISummaryProvider } from '../isummary-provider.js';
import { NewsModel } from '../../common/news-model';
import { weatherIconsConst } from './weather-icons-const.js';
import { apiConstants, ProviderConfig } from '../../common/api-constants';
import { apiProvidersConst } from '../../common/api-providers-const';
import cloneDeep from 'lodash/cloneDeep';

export class WeatherService implements ISummaryProvider {
    private cityName: string;

    constructor(cityName?: string) {
        this.cityName = cityName || '';
    }

    getSummary(cityName?: string): Promise<NewsModel[]>  {
        const options: ProviderConfig = cloneDeep(apiConstants.weather);
        options.path = options.path
            .replace('{0}', cityName ? cityName : this.cityName)
            .replace('{1}', '5');
        return performGetRequest(options, dataTransformer);

        function dataTransformer(data: any) {
            if (!data?.list) {
                return [];
            }

            const currentDate: Date = new Date();
            let forecastDescription: string = '';
            let weatherCode: number = 0;

            data.list.forEach(processWeatherDataItem);

            return [
                new NewsModel({
                    title: WeatherSummaryService.get(data.list),
                    info: forecastDescription,
                    url: apiConstants.webAppUrl + '/index.html#!/weather-line-chart',
                    image: apiConstants.apiUrl + weatherIconsConst[weatherCode],
                    dateTime: new Date(),
                    provider: apiProvidersConst.weather.id
                })
            ];

            function processWeatherDataItem(weatherDataItem: any) {
                if (!weatherCode) {
                    weatherCode = weatherDataItem.weather[0].id;
                }
                forecastDescription += getCurrentDayDescription(weatherDataItem);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            function getCurrentDayDescription(weatherDataItem: any): string {
                const itemSeparator: string = '  ';
                const lineSeparator: string = '\r\n';

                return formatDate(currentDate) + itemSeparator +
                    weatherDataItem.weather[0].description + itemSeparator +
                    Math.round(weatherDataItem.temp.min).toString() + ' / ' +
                    Math.round(weatherDataItem.temp.max).toString() + lineSeparator;

                function formatDate(dateValue: Date) {
                    return `${dateValue.getDate().toString()}-${(dateValue.getMonth() + 1).toString()}`;
                }
            }
        }
    }

    getDetailedForecast(cityName: string) {
        const options: ProviderConfig = cloneDeep(apiConstants.weather);
        options.path = options.path
            .replace('{0}', cityName ? cityName : this.cityName)
            .replace('{1}', '16');
        return performGetRequest(options, dataTransformer);

        function dataTransformer(data: any) {
            const hasResults = data?.list;
            if (!hasResults) {
                return {
                    rawData: null,
                    mappedData: null
                };
            }

            let currentDate = new Date();
            const weatherModelsList: any[] = [];

            data.list.forEach(processWeatherDataItem);

            return {
                rawData: data,
                mappedData: weatherModelsList
            };

            function processWeatherDataItem(weatherDataItem: any) {
                weatherModelsList.push(new NewsModel({
                    title: `Weather ${formatDate(currentDate)}`,
                    info: getCurrentDayDescription(weatherDataItem),
                    url: `${apiConstants.webAppUrl}/index.html#!/weather-line-chart`,
                    image: apiConstants.apiUrl + weatherIconsConst[weatherDataItem.weather[0].id],
                    dateTime: currentDate,
                    provider: apiProvidersConst.weather.id
                }));

                currentDate.setDate(currentDate.getDate() + 1);

                function formatDate(dateValue: Date) {
                    return `${dateValue.getDate().toString()}-${(dateValue.getMonth() + 1).toString()}`;
                }
            }

            function getCurrentDayDescription(weatherDataItem: any) {
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
