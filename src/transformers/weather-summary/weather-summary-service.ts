import { weatherCodesConst } from './weather-codes-const';

class WeatherEntry {
    public min: number;
    public max: number;
    public weatherCode: number;
    public description: string;

    constructor({ min, max, weatherCode, description }: { min: number, max: number, weatherCode: number, description: string }) {
        this.min = min;
        this.max = max;
        this.weatherCode = weatherCode;
        this.description = description;
    }
}

export class WeatherSummaryService {
    static get(modelList: any[]): string {
        const changesMap: WeatherEntry[] = [new WeatherEntry({
            min: 0,
            max: 0,
            weatherCode: modelList[0].weather[0].id,
            description: modelList[0].weather[0].description
        })];
        const subList: any[] = modelList.slice(1, 3);
        let minSum: number = 0;
        let maxSum: number = 0;
        let summary: string = '';

        subList.forEach((model, index) => {
            changesMap.push(new WeatherEntry({
                min: model.temp.min - modelList[index].temp.min,
                max: model.temp.max - modelList[index].temp.max,
                weatherCode: model.weather[0].id,
                description: model.weather[0].description
            }));
        });

        changesMap.forEach((model: WeatherEntry) => {
            minSum += model.min;
            maxSum += model.max;
        });

        if (minSum < 0 && maxSum < 0) {
            summary += 'Getting colder';
        } else if (minSum > 0 && maxSum > 0) {
            summary += 'Getting warmer';
        } else {
            summary += 'Stable';
        }

        switch (Math.floor(changesMap[1].weatherCode / 100)) {
            case weatherCodesConst.THUNDERSTORM:
            case weatherCodesConst.DRIZZLE:
            case weatherCodesConst.RAIN:
                summary += ', stay dry';
                break;
            case weatherCodesConst.SNOW:
                summary += ', stay warm';
                break;
        }

        if (changesMap[0].weatherCode !== changesMap[1].weatherCode) {
            summary += '; ' + changesMap[1].description;
        }

        return summary;
    }
}
