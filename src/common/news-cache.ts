import { TfIdfItem } from '../transformers/keywords/tf-idf/tf-idf-item-model';
import { NewsModel } from './news-model';

export class NewsCache {
    public news: NewsModel[];
    public techAndScience: NewsModel[];
    public weather: NewsModel[];
    public weatherRaw: any[];
    public newsKeywords: TfIdfItem[];

    constructor() {
        this.news = [];
        this.techAndScience = [];
        this.weather = [];
        this.weatherRaw = [];
        this.newsKeywords = [];
    }
}