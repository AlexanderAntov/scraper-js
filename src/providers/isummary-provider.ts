import { NewsModel } from '../common/news-model';

interface ISummaryProvider {
    getSummary(): Promise<NewsModel[]>
}

export { ISummaryProvider };
