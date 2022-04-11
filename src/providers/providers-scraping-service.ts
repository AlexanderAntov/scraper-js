import { apiProvidersConst } from '../common/api-providers-const.js';
import { NewsModel } from '../common/news-model';
import { BbcNewsService } from './news/bbc/bbc-news-service';
import { CnnNewsService } from './news/cnn/cnn-news-service';

export class ProvidersScrapingService {
    private ccnNews: CnnNewsService;
    private bbcNews: BbcNewsService;

    constructor() {
        this.ccnNews = new CnnNewsService();
        this.bbcNews = new BbcNewsService();
    }

    scrape(model: NewsModel): Promise<string> {
        const providerId: Number | null = model?.provider ? model.provider : null;
        switch (providerId) {
            case apiProvidersConst.BBC.id:
                return this.bbcNews.scrape(model);
            case apiProvidersConst.CNN.id:
                return this.ccnNews.scrape(model);
            default:
                return Promise.resolve('');
        }
    }
}