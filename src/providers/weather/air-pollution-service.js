import { apiConstants, apiProvidersConst, httpService, newsModelFactory, newsModelService } from '../../common/common.js';

export default class AirPollution {
    static getSummary() {
        let options = newsModelService.clone(apiConstants.airPollution);
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
            let info = '';
            let date = null;

            if (data && data.length > 0) {
                data.reverse().forEach(model => {
                    date = formatDate(new Date(model.time.current * 1000));
                    info += `${date}  ${model.P1.current} / ${model.P2.current}\r\n`;
                });
            }

            return info;

            function formatDate(dateValue) {
                return `${dateValue.getDate().toString()}-${(dateValue.getMonth() + 1).toString()}`;
            }
        }
    }
}
