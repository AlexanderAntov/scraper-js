import { weatherCodesConst } from './weather-codes-const';

export class WeatherSummaryService {
    static get(modelList) {
        const changesMap = [{
            min: 0,
            max: 0,
            weatherCode: modelList[0].weather[0].id,
            description: modelList[0].weather[0].description
        }];
        const subList = modelList.slice(1, 3);
        let minSum = 0;
        let maxSum = 0;
        let summary = '';

        subList.forEach((model, index) => {
            changesMap.push({
                min: model.temp.min - modelList[index].temp.min,
                max: model.temp.max - modelList[index].temp.max,
                weatherCode: model.weather[0].id,
                description: model.weather[0].description
            })
        });

        changesMap.forEach((model) => {
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
