import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../common/common.js';
import { cloneDeep, groupBy, sumBy } from 'lodash';

export class AirPollutionService {
    static getSummary() {
        let options = cloneDeep(apiConstants.airPollution);
        return HttpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            return [
                new NewsModel({
                    title: 'Air pollution',
                    info: constructInfo(data),
                    url: null,
                    image: null,
                    dateTime: new Date().toDateString(),
                    provider: apiProvidersConst.AIR_POLLUTION.id
                })
            ];
        }

        function parseData(data) {
            const list = [];
            data.forEach(parentModel => {
                parentModel.forEach(childModel => {
                    const dateTime = new Date(parseInt(childModel[0]));
                    list.push({
                        dateTime: dateTime,
                        date: dateTime.getDate(),
                        value: childModel[1]
                    });
                });
            });
            return list;
        }

        function getListWithAverageValues(list) {
            const averageValuesList = [];
            const groupedData = groupBy(list, 'date');
            for (const date in groupedData) {
                if (groupedData.hasOwnProperty(date)) {
                     averageValuesList.push({
                        dateTime: groupedData[date][0].dateTime,
                        value: Math.round(sumBy(groupedData[date], 'value') / groupedData[date].length)
                     });
                }
            }
            return averageValuesList;
        }

        function constructInfo(data) {
            const list = parseData(data);
            const normalizedList = getListWithAverageValues(list);
            let info = '';
            let date = null;

            if (normalizedList && normalizedList.length > 0) {
                normalizedList.reverse().forEach(model => {
                    date = formatDate(new Date(model.dateTime));
                    info += `${date}  ${model.value}\r\n`;
                });
            }

            return info;

            function formatDate(dateValue) {
                return `${dateValue.getDate().toString()}-${(dateValue.getMonth() + 1).toString()}`;
            }
        }
    }
}
