import { apiConstants, apiProvidersConst, httpService, newsModelFactory } from '../../common/common.js';

export default class AirPollution {
    static getSummary() {
        let options = httpService.clone(apiConstants.airPollution);
        options.path = options.path.replace('{0}', options.token);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            return [
                newsModelFactory.get({
                    title: 'Air pollution',
                    info: constructInfo(data),
                    url: null,
                    image: null,
                    dateTime: new Date().toDateString(),
                    provider: apiProvidersConst.AIR_POLLUTION.id
                })
            ];
        }

        function constructInfo(data) {
            const itemSeparator = '  ',
                lineSeparator = '\r\n';
            let info = '';
            if (data && data.table && data.table.values) {
                info += 'current: ' + data.sensor.P1.current + lineSeparator;
                data.table.values.reverse().forEach((model) => {
                    info += formatDate(new Date(model.time * 1000)) + ' ' + model.P1 + lineSeparator;
                });
            }
            return info;

            function formatDate(dateValue) {
                return dateValue.getDate().toString() + '-' + (dateValue.getMonth() + 1).toString();
            }
        }
    }
}
