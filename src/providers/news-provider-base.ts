import { ProviderConfig } from '../common/api-constants';
import { NewsModel } from '../common/news-model';
import { performGetRequest } from '../common/http.utils';
import cloneDeep from 'lodash/cloneDeep';

export class NewsProviderBase {
    public config: ProviderConfig;

    constructor(config: ProviderConfig) {
        this.config = cloneDeep(config);
    }

    get(): Promise<NewsModel[]> {
        return performGetRequest(this.config, this.transformRawData);
    }

    transformRawData(data: any): NewsModel[] {
        throw new Error('not Implemented');
    }

    scrape?(model: NewsModel): Promise<string> {
        throw new Error('not Implemented');
    }
}
