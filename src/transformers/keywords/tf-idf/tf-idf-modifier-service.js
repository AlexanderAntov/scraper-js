import * as _ from 'lodash';
import tfIdfService from './tf-idf-service.js';
import mailerService from '../../../common/mailer-service.js';

export default class TfIdfModifierService {
    constructor(options = {}) {
        this.options = {
            MIN_PHRASE_LENGTH: options.MIN_PHRASE_LENGTH || 3,
            TF_SCORE_MODIFIER: this.tfScoreModifier.bind(this),
            TITLE_KEYWORD_MULTIPLIER: options.TITLE_KEYWORD_MULTIPLIER || 1.5,
            LONG_KEYWORD_MULTIPLIER: options.LONG_KEYWORD_MULTIPLIER || null,
            CAPITALIZED_KEYWORDS_MULTIPLIER: options.CAPITALIZED_KEYWORDS_MULTIPLIER || null,
            TOP_NEWS_SCORE: options.TOP_NEWS_SCORE || 1.5,
            TOP_NEWS_SCORE_STEP: options.TOP_NEWS_SCORE_STEP || 0.1,
            N_GRAM_MIN_OCCURRENCES: options.N_GRAM_MIN_OCCURRENCES || 1,
            N_GRAM_MAX_WORDS: options.N_GRAM_MAX_WORDS || 5,
            TF_IDF_SCORE_THRESHOLD: options.TF_IDF_SCORE_THRESHOLD || 0.05
        };
        this.tfIdf = new tfIdfService(this.options);
    }

    get(modelsList, sendMail) {
        if (_.isEmpty(modelsList)) {
            throw Error('no models have been provided for keyword evaluation');
        }

        let weightedKeywords = this.tfIdf
            .get(this.addTopNewsScore(modelsList.filter(this.removeNonEnglishNews)));

        if (sendMail) {
            let keywordsList = _.map(_.orderBy(weightedKeywords, ['score'], ['desc']), (model, index) => {
                let result = model.word + '   ' + model.score.toString();
                if (index < 50) {
                    result += '   https://www.google.com/search?q=' + model.word.replace(/\s+/g, '+');
                }
                return result;
            });
            mailerService.send(
                'News keywords',
                keywordsList.join('\n')
            );
        }

        return weightedKeywords;
    }

    removeNonEnglishNews(newsModel) {
        const result = newsModel.provider !== 'google' && newsModel.provider !== 'weather';
        if (result) {
            newsModel.text = newsModel.title + '\n' + newsModel.info + '\n';
        }
        return result;
    }

    addTopNewsScore(modelsList) {
        let currentProvider = null,
            topNewsScore = null;

        modelsList.forEach((newsModel) => {
            if (this.options.TOP_NEWS_SCORE) {
                if (!currentProvider) {
                    currentProvider = newsModel.provider;
                } else if (currentProvider !== newsModel.provider) {
                    topNewsScore = this.options.TOP_NEWS_SCORE;
                    newsModel.topNewsScore = topNewsScore;
                    currentProvider = newsModel.provider;
                } else if (topNewsScore > 1) {
                    topNewsScore -= this.options.TOP_NEWS_SCORE_STEP;
                    newsModel.topNewsScore = topNewsScore;
                }
            }
        });

        return modelsList;
    }

    tfScoreModifier(tfScore, model, word) {
        //title keyword modifier
        if (model.title.indexOf(word) > -1) {
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
