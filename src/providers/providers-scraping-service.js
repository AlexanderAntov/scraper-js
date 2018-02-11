import apiProvidersConst from '../common/api-providers-const.js';
import bbcNewsService from './news/bbc/bbc-news-service.js';
import cnnNewsService from './news/cnn/cnn-news-service.js.js';

export default class ProvidersScrapingService {
    static scrape(model) {
        const providerId = model && model.provider ? model.provider : null;
        switch (providerId) {
            case apiProvidersConst.BBC.id:
                return bbcNewsService.scrape(model);
            case apiProvidersConst.CNN.id:
                return cnnNewsService.scrape(model);
            default:
                return Promise.resolve(null);
        }
    }
}