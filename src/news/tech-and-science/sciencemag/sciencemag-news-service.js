import xml2js from 'xml2js';
import { apiConstants, httpService, newsModelFactory } from '../../../common/common.js';

export default class ScienceMagNews {
    get() {
        let options = httpService.clone(apiConstants.scienceMag);
        return httpService.performGetRequest(options, dataTransformer);

        function dataTransformer(data) {
            let articlesArray = [],
                currentModel = null,
                currentInfo = null;

            xml2js.parseString(data, function (err, result) {
                result['rdf:RDF'].item.forEach(function (newsItemData) {
                    currentInfo = httpService.trim(
                        newsItemData
                            .description[0]
                            .replace(/<(?:.|\n)*?>/gm, '')
                            .replace(/\n/, '')
                    );
                    currentModel = newsModelFactory.get({
                        title: newsItemData.title[0],
                        info: currentInfo,
                        url: newsItemData.link[0],
                        image: null,
                        dateTime: newsItemData['dc:date'][0],
                        provider: 'sciencemag'
                    });

                    if (currentModel.info) {
                        articlesArray.push(currentModel);
                    }
                });
            });
            return articlesArray;
        }
    }
}
