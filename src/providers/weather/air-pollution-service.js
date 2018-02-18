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
                valueSeparator = '/',
                lineSeparator = '\r\n';
            let info = '';
            if (data && data.length > 0) {
                data.forEach((model) => {
                    info += formatDate(new Date(model.time.current * 1000)) + 
                        itemSeparator + 
                        model.P1.current + 
                        valueSeparator +
                        model.P2.current +
                        lineSeparator;
                });
            }
            return info;

            function formatDate(dateValue) {
                return dateValue.getDate().toString() + '-' + (dateValue.getMonth() + 1).toString();
            }
        }
    }
}
