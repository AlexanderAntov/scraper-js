export default class WeatherSummaryService {
    static get(modelList) {
        let changesMap = [{
                min: 0,
                max: 0,
                weatherCode: modelList[0].weather[0].id,
                description: modelList[0].weather[0].description
            }],
            subList = modelList.slice(1, 3),
            minSum = 0,
            maxSum = 0,
            summary = '';

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
            summary += 'Rather stable';
        }

        if (changesMap[0].weatherCode !== changesMap[1].weatherCode) {
            summary += ' ' + changesMap[1].description;
        }

        return summary;
    }
}
