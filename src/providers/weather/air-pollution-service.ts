import { ISummaryProvider } from '../isummary-provider.js';
import { performGetRequest } from '../../common/http.utils';
import { NewsModel } from '../../common/news-model';
import { apiConstants, ProviderConfig } from '../../common/api-constants';
import { apiProvidersConst } from '../../common/api-providers-const';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import sumBy from 'lodash/sumBy';

class PollutionValue {
    public dayOfTheMonth: Number | undefined;
    public dateTime: Date;
    public value: Number;

    constructor({ dayOfTheMonth, dateTime, value }: { dayOfTheMonth?: Number, dateTime: Date, value: Number }) {
        this.dayOfTheMonth = dayOfTheMonth;
        this.dateTime = dateTime;
        this.value = value;
    }
}

export class AirPollutionService implements ISummaryProvider {
    getSummary(): Promise<NewsModel[]> {
        const options: ProviderConfig = cloneDeep(apiConstants.airPollution);
        return performGetRequest(options, dataTransformer);

        function dataTransformer(data: any): NewsModel[] {
            return [
                new NewsModel({
                    title: 'Air pollution',
                    info: constructInfo(data),
                    url: null,
                    image: null,
                    dateTime: new Date(),
                    provider: apiProvidersConst.airPollution.id
                })
            ];
        }

        function constructInfo(data: any): string {
            const list = parseData(data);
            const normalizedList: PollutionValue[] = getListWithAverageValues(list);
            let info: string = '';
            let date: string = '';

            if (normalizedList?.length > 0) {
                normalizedList.reverse().forEach((model: PollutionValue) => {
                    date = formatDate(new Date(model.dateTime));
                    info += `${date}  ${model.value}\r\n`;
                });
            }

            return info;

            function formatDate(dateValue: Date) {
                return `${dateValue.getDate().toString()}-${(dateValue.getMonth() + 1).toString()}`;
            }
        }

        function parseData(data: any) {
            const list: PollutionValue[] = [];
            data.forEach((parentModel: any) => {
                parentModel.forEach((childModel: any) => {
                    const dateTime = new Date(parseInt(childModel[0]));
                    list.push(new PollutionValue({
                        dateTime: dateTime,
                        dayOfTheMonth: dateTime.getDate(),
                        value: childModel[1]
                    }));
                });
            });
            return list;
        }

        function getListWithAverageValues(list: any[]) {
            const averageValuesList: PollutionValue[] = [];
            const groupedData = groupBy(list, 'dayOfTheMonth');
            for (const date in groupedData) {
                if (groupedData.hasOwnProperty(date)) {
                     averageValuesList.push(new PollutionValue({
                         dateTime: groupedData[date][0].dateTime,
                         value: Math.round(sumBy(groupedData[date], 'value') / groupedData[date].length)
                     }));
                }
            }
            return averageValuesList;
        }
    }
}
