import apiProvidersConst from '../common/api-providers-const.js';
import bbcNewsService from './news/bbc/bbc-news-service.js';

export default class ProvidersScrapingService {
    static scrape(model) {
        const providerId = model && model.provider ? model.provider : null;
        switch (providerId) {
            case apiProvidersConst.BBC.id:
                return bbcNewsService.scrape(model);
            default:
                return Promise.resolve(null);
        }
    }
}