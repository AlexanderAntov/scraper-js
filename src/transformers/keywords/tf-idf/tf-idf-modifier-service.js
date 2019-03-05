import { isEmpty, orderBy, find } from 'lodash';
import apiProvidersConst from '../../../common/api-providers-const.js';
import tfIdfService from './tf-idf-service.js';
import mailerService from '../../../common/mailer-service.js';
import stringComparisonService from '../string-comparison/string-comparison-service.js';
import TfIdfOptions from './tf-idf-options.js';

export default class TfIdfModifierService {
    constructor() {
        this.options = new TfIdfOptions({
            TF_SCORE_MODIFIER: (...args) => this._tfScoreModifier(...args)
        });
        this.tfIdf = new tfIdfService(this.options);
    }

    get(modelsList, cache = {}) {
        if (isEmpty(modelsList)) {
            throw Error('no models have been provided for keyword evaluation');
        }

        let weightedKeywords = this.tfIdf
            .get(this.addTopNewsScore(modelsList.filter((newsModel) => {
                return newsModel.provider !== apiProvidersConst.GOOGLE_BG.id && 
                    newsModel.provider !== apiProvidersConst.WEATHER.id &&
                    newsModel.provider !== apiProvidersConst.AIR_POLLUTION.id;
            })));

        const sortedList = orderBy(weightedKeywords, ['score'], ['desc']),
            sortedListLength = sortedList.length,
            filteredList = [],
            processedIds = [];
        let variationModels = [],
            i,
            j;

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
                if (!find(filteredList, { id: highestScoreKeyword.id })) {
                    filteredList.push(highestScoreKeyword);
                }
            }
            variationModels = [];
        }

        cache.newsKeywords = orderBy(filteredList, ['score'], ['desc']);
        return cache.newsKeywords;
    }

    sendMail(modelsList) {
        if (isEmpty(modelsList)) {
            throw Error('no models have been provided for mailing');
        }

        const keywordsList = [];
        let result;
        for (let i = 0; i < 50; i++) {
            result =
                modelsList[i].word + '   ' +
                modelsList[i].score.toString() +
                '   https://www.google.com/search?q=' +
                modelsList[i].word.replace(/\s/g, '+');
            keywordsList.push(result);
        }
        mailerService.send(
            'News keywords',
            keywordsList.join('\n')
        );
    }

    addTopNewsScore(modelsList) {
        const modelsListLength = modelsList.length;
        let currentProvider = null,
            topNewsScore = null;

        for (let i = 0; i < modelsListLength; i++) {
            if (this.options.TOP_NEWS_SCORE) {
                if (!currentProvider) {
                    currentProvider = modelsList[i].provider;
                } else if (currentProvider !== modelsList[i].provider) {
                    topNewsScore = this.options.TOP_NEWS_SCORE;
                    modelsList[i].topNewsScore = topNewsScore;
                    currentProvider = modelsList[i].provider;
                } else if (topNewsScore > 1) {
                    topNewsScore -= this.options.TOP_NEWS_SCORE_STEP;
                    modelsList[i].topNewsScore = topNewsScore;
                }
            }
        }

        return modelsList;
    }

    _areStringsSimilar(first, second) {
        let result = first.indexOf(second) !== -1 || second.indexOf(first) !== -1;
        if (this.options.THRESHOLD_STRING_DISTANCE > 0 && this.options.THRESHOLD_STRING_DISTANCE_LENGTH > 0) {
            const firstLength = first.length;

            if (firstLength > this.options.THRESHOLD_STRING_DISTANCE_LENGTH) {
                const levenshteinDistance = stringComparisonService.getLevenshteinDistance(first, second);
                const distanceInPercent = (levenshteinDistance / firstLength) * 100;
                result = result || distanceInPercent < this.options.THRESHOLD_STRING_DISTANCE;
            }
        }
        return result;
    }

    _tfScoreModifier(tfScore, model, word) {
        //title keyword modifier
        if (model.title.indexOf(word) !== -1) {
            tfScore = tfScore * this.options.TITLE_KEYWORD_MULTIPLIER;
        }
        //top news modifier
        if (model.topNewsScore) {
            tfScore = tfScore * model.topNewsScore;
        }
        //multiple words modifier
        if (this.options.LONG_KEYWORD_MULTIPLIER !== 1) {
            const wordCountInPhrase = word.split(' ').length || 1;
            if (this.options.LONG_KEYWORD_MULTIPLIER) {
                tfScore = tfScore * this.options.LONG_KEYWORD_MULTIPLIER;
            } else if (wordCountInPhrase > 1) {
                tfScore =  Math.pow(1 + tfScore, wordCountInPhrase);
            }
        }
        //capital letters modifier
        const capitalLettersCount = countUpperCaseChars(word);
        if (this.options.CAPITALIZED_KEYWORDS_MULTIPLIER && capitalLettersCount > 0) {
            tfScore = tfScore * this.options.CAPITALIZED_KEYWORDS_MULTIPLIER;
        } else {
            tfScore = tfScore * (1 + (capitalLettersCount / 10));
        }

        return tfScore;

        function countUpperCaseChars(word) {
            let count = 0,
                wordLength = word.length,
                i;

            for (i = 0; i < wordLength; i++) {
                if(/[A-Z]/.test(word.charAt(i))) {
                    count++;
                }
            }

            return count;
        }
    }
}
