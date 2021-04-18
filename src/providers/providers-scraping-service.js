import { apiProvidersConst } from '../common/api-providers-const.js';
import { BbcNewsService } from './news/bbc/bbc-news-service.js';
import { CnnNewsService } from './news/cnn/cnn-news-service.js.js';

export class ProvidersScrapingService {
    static scrape(model) {
        const providerId = model && model.provider ? model.provider : null;
        switch (providerId) {
            case apiProvidersConst.BBC.id:
                return BbcNewsService.scrape(model);
            case apiProvidersConst.CNN.id:
                return CnnNewsService.scrape(model);
            default:
                return Promise.resolve(null);
        }
    }
}