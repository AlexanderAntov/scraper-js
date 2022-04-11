import { NumericDictionary } from '../../../common/dictionary.js';
import { TfIdfCoreService } from './tf-idf-core-service.js';
import { MailerService } from '../../../common/mailer-service.js';
import { StringComparisonService } from '../string-comparison/string-comparison-service';
import { NewsModel } from '../../../common/news-model';
import { NewsCache } from '../../../common/news-cache.js';
import { TfIdfItem } from './tf-idf-item-model';
import { TfIdfOptions } from './tf-idf-options.js';
import { apiProvidersConst } from '../../../common/api-providers-const';
import { ignoredKeywordsConst } from '../ignored-keywords-const';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import find from 'lodash/find';

export class TfIdfService {
    private options: TfIdfOptions;
    private tfIdfCoreService: TfIdfCoreService;
    private topNewsScoreMap: NumericDictionary;

    constructor() {
        this.options = new TfIdfOptions({
            tfScoreModifier: (tfScore: number, model: NewsModel, word: string) => this._tfScoreModifier(tfScore, model, word)
        });
        this.tfIdfCoreService = new TfIdfCoreService(this.options);
        this.topNewsScoreMap = [];
    }

    get(modelsList: NewsModel[], cache: NewsCache = null): TfIdfItem[] {
        if (isEmpty(modelsList)) {
            throw Error('no models have been provided for keyword evaluation');
        }

        const filteredNewsList: NewsModel[] = modelsList.filter((newsModel: NewsModel) => {
            return newsModel.provider !== apiProvidersConst.bta.id &&
                newsModel.provider !== apiProvidersConst.weather.id &&
                newsModel.provider !== apiProvidersConst.airPollution.id;
        });
        const listWithTopNewsScore: NewsModel[] = this.addTopNewsScore(filteredNewsList);
        const weightedKeywords: TfIdfItem[] = this.tfIdfCoreService.get(listWithTopNewsScore);

        const sortedList: TfIdfItem[] = orderBy(weightedKeywords, ['score'], ['desc']);
        const sortedListLength: number = sortedList.length;
        const uniqueKeywordsList: TfIdfItem[] = [];
        const processedIds: number[] = [];
        let variationModels: TfIdfItem[] = [];
        let i: number;
        let j: number;
        
        for (i = 0; i < sortedListLength; i++) {
            if (processedIds.indexOf(sortedList[i].id) === -1) {
                processedIds.push(sortedList[i].id);
                variationModels.push(sortedList[i]);
            }
            for (j = 0; j < sortedListLength; j++) {
                if (processedIds.indexOf(sortedList[j].id) === -1 &&
                    this._areStringsSimilar(sortedList[i].word, sortedList[j].word)) {
                    processedIds.push(sortedList[j].id);
                    variationModels.push(sortedList[j]);
                } else {
                    continue;
                }
            }

            if (!isEmpty(variationModels)) {
                const highestScoreKeyword = orderBy(variationModels, ['score'], ['desc'])[0];
                if (!find(uniqueKeywordsList, { id: highestScoreKeyword.id })) {
                    uniqueKeywordsList.push(highestScoreKeyword);
                }
            }
            variationModels = [];
        }

        const filteredKeywordList: TfIdfItem[] = uniqueKeywordsList.filter(item => !ignoredKeywordsConst.includes(item.word));
        const sortedKeywordsList = orderBy(filteredKeywordList, ['score'], ['desc']);
        if (cache) {
            cache.newsKeywords = sortedKeywordsList;
        }
        return sortedKeywordsList;
    }

    sendMail(keywordModelsList: TfIdfItem[]) {
        if (isEmpty(keywordModelsList)) {
            throw Error('no models have been provided for mailing');
        }

        const keywordsList = [];
        for (let i = 0; i < 50; i++) {
            keywordsList.push(this._formatKeywordMailItem(keywordModelsList[i]));
        }
        const emailBody = `
        <html>
            <head>
                <meta charset="utf-8" />
            </head>
            <body>
                ${keywordsList.join('')}
            </body>
        </html>
        `;
        MailerService.send(
            'News keywords',
            emailBody,
            true
        );
    }

    addTopNewsScore(modelsList: NewsModel[]): NewsModel[] {
        const modelsListLength: number = modelsList.length;
        let currentProvider: number | null = null;
        let topNewsScore: number | null = null;

        for (let i = 0; i < modelsListLength; i++) {
            if (this.options.topNewsScore) {
                const id: number = modelsList[i].id;
                if (!currentProvider) {
                    currentProvider = modelsList[i].provider;
                } else if (currentProvider !== modelsList[i].provider) {
                    topNewsScore = this.options.topNewsScore;
                    this.topNewsScoreMap[id] = topNewsScore;
                    currentProvider = modelsList[i].provider;
                } else if (topNewsScore > 1) {
                    topNewsScore -= this.options.topNewsScoreStep;
                    this.topNewsScoreMap[id] = topNewsScore;
                }
            }
        }

        return modelsList;
    }

    _formatKeywordMailItem(item: TfIdfItem): string {
        const urlFormattedKeyword: string = item.word.replace(/\s/g, '+');
        const url: string = `https://www.google.com/search?q=${urlFormattedKeyword}`;
        return `<a href="${url}" target="_blank">${item.word}</a>   ${item.score} <br/>`;
    }

    _areStringsSimilar(first: string, second: string): boolean {
        let result: boolean = first.indexOf(second) !== -1 || second.indexOf(first) !== -1;
        if (this.options.thresholdStringDistance > 0 && this.options.thresholdStringDistanceLength > 0) {
            const firstLength = first.length;

            if (firstLength > this.options.thresholdStringDistanceLength) {
                const levenshteinDistance: number = StringComparisonService.getLevenshteinDistance(first, second);
                const distanceInPercent: number = (levenshteinDistance / firstLength) * 100;
                result = result || distanceInPercent < this.options.thresholdStringDistance;
            }
        }
        return result;
    }

    _tfScoreModifier(tfScore: number, model: NewsModel, word: string): number {
        const id = model.id;
        //title keyword modifier
        if (model.title.indexOf(word) !== -1) {
            tfScore = tfScore * this.options.titleKeywordMultiplier;
        }
        //top news modifier
        if (this.topNewsScoreMap[id]) {
            tfScore = tfScore * this.topNewsScoreMap[id];
        }
        //multiple words modifier
        if (this.options.longKeywordMultiplier !== 1) {
            const wordCountInPhrase = word.split(' ').length || 1;
            if (this.options.longKeywordMultiplier) {
                tfScore = tfScore * this.options.longKeywordMultiplier;
            } else if (wordCountInPhrase > 1) {
                tfScore =  Math.pow(1 + tfScore, wordCountInPhrase);
            }
        }
        //capital letters modifier
        const capitalLettersCount = this._countUpperCaseChars(word);
        if (this.options.capitalizedKeywordMultiplier && capitalLettersCount > 0) {
            tfScore = tfScore * this.options.capitalizedKeywordMultiplier;
        } else {
            tfScore = tfScore * (1 + (capitalLettersCount / 10));
        }

        return tfScore;
    }

    _countUpperCaseChars(word: string): number {
        let count: number = 0;
        let wordLength: number = word.length;
        let i: number;

        for (i = 0; i < wordLength; i++) {
            if (/[A-Z]/.test(word.charAt(i))) {
                count++;
            }
        }

        return count;
    }
}
