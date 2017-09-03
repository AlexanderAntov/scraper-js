import * as _ from 'lodash';
import stopWordsList from '../stopwords-const.js';
import mailerService from '../../../common/mailer-service.js';

export default class TfIdfService {
    constructor(options = {}) {
        this.options = {
            MIN_PHRASE_LENGTH: options.MIN_PHRASE_LENGTH || 3,
            TITLE_KEYWORD_MULTIPLIER: options.TITLE_KEYWORD_MULTIPLIER || 1.5,
            LONG_KEYWORD_MULTIPLIER: options.LONG_KEYWORD_MULTIPLIER || null,
            CAPITALIZED_KEYWORDS_MULTIPLIER: options.CAPITALIZED_KEYWORDS_MULTIPLIER || null,
            TOP_NEWS_SCORE: options.TOP_NEWS_SCORE || 1.5,
            TOP_NEWS_SCORE_STEP: options.TOP_NEWS_SCORE_STEP || 0.1,
            N_GRAM_MIN_OCCURRENCES: options.N_GRAM_MIN_OCCURRENCES || 1,
            N_GRAM_MAX_WORDS: options.N_GRAM_MAX_WORDS || 5
        };
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

    get(modelsList, sendMail) {
        if (_.isEmpty(modelsList)) {
            throw Error('no models have been provided for keyword evaluation');
        }

        let tfMap = {},
            idfMap = {},
            tfIdfMap = [];

        this.addTopNewsScore(modelsList).forEach((model, index) => {
            let textItemWords = this.generateNGrams(this.normalizeText(model.text)),
                textItemWordsLength = textItemWords.length;
            textItemWords.forEach((word) => {
                word = word.trim();
                if (word && word.length > this.options.MIN_PHRASE_LENGTH) {
                    if (!tfMap[word]) {
                        tfMap[word] = [];
                        evalFrequency(
                            model,
                            word,
                            this.options,
                            textItemWordsLength
                        );
                    } else if (tfMap[word].length < index + 1) {
                        evalFrequency(
                            model,
                            word,
                            this.options,
                            textItemWordsLength
                        );
                    }
                }
            });
        });

        Object.keys(tfMap).forEach((word) => {
            let score = (tfMap[word].reduce((x, y) => { return x + y }) / tfMap[word].length) * idfMap[word];
            tfIdfMap.push({
                word: word,
                score: score
            });
        });

        if (sendMail) {
            let keywordsList = _.map(_.orderBy(tfIdfMap, ['score'], ['desc']), (model) => {
                return model.word + '   ' + model.score.toString();
            });
            mailerService.send(
                'News keywords',
                keywordsList.join('\n')
            );
        }

        return tfIdfMap;

        function evalFrequency(model, word, options, textItemWordsLength) {
            const wordOccurrenceCount = evalWordCount(model.text, word);
            let tfScore = wordOccurrenceCount / textItemWordsLength;

            idfMap[word] = idfMap[word] ? idfMap[word] + wordOccurrenceCount : wordOccurrenceCount;
            modifyTFScore();
            tfMap[word].push(tfScore);

            function modifyTFScore() {
                //title keyword modifier
                if (model.title.indexOf(word) > -1) {
                    tfScore = tfScore * options.TITLE_KEYWORD_MULTIPLIER;
                }
                //top news modifier
                if (model.topNewsScore) {
                    tfScore = tfScore * model.topNewsScore;
                }
                //multiple words modifier
                if (options.LONG_KEYWORD_MULTIPLIER !== 1) {
                    const wordCountInPhrase = word.split(' ').length || 1;
                    if (options.LONG_KEYWORD_MULTIPLIER) {
                        tfScore = tfScore * options.LONG_KEYWORD_MULTIPLIER;
                    } else if (wordCountInPhrase > 1) {
                        tfScore =  Math.pow(1 + tfScore, wordCountInPhrase);
                    }
                }
                //capital letters modifier
                const capitalLettersCount = countUpperCaseChars(word);
                if (options.CAPITALIZED_KEYWORDS_MULTIPLIER && capitalLettersCount > 0) {
                    tfScore = tfScore * options.CAPITALIZED_KEYWORDS_MULTIPLIER;
                } else {
                    tfScore = tfScore * (1 + (capitalLettersCount / 10));
                }
            }
        }

        function evalWordCount(text = '', word = '') {
            if (word.length <= 0) {
                return (text.length + 1)
            }

            let count = 0,
                position = 0;

            while (true) {
                position = text.indexOf(word, position);
                if (position >= 0) {
                    ++count;
                    position += word.length;
                } else {
                    break;
                };
            }

            return count;
        }

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

    normalizeText(text) {
        let stopwordsRegEx = '',
            i,
            stopword;

        for (i in stopWordsList) {
            stopword = stopWordsList[i];
            if (i !== stopWordsList.length - 1) {
                stopwordsRegEx = stopwordsRegEx + stopword + '|';
            }
            else {
                stopwordsRegEx = stopwordsRegEx + stopword;
            }
        }

        return text.replace(
                new RegExp('\\b(?:' + stopwordsRegEx.substring(0, stopwordsRegEx.length - 1) + ')\\b', 'ig'), ' '
            )
            .replace(/['!"“”’#$%&()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, '')
            .replace(/\n/g, ' ')
            .replace(/[0-9]/g, ' ');
    }

    generateNGrams(text) {
        let keys = [null],
            key,
            i,
            j,
            s;
    
        for (i = 1; i <= this.options.N_GRAM_MAX_WORDS; i++) {
            keys.push({});
        }
    
        text = text.split(/\s+/);
        const textLength = text.length;
    
        for (i = 0; i < textLength; i++) {
            s = text[i];
            keys[1][s] = (keys[1][s] || 0) + 1;
    
            for (j = 2; j <= this.options.N_GRAM_MAX_WORDS; j++) {
                if (i + j <= textLength) {
                    s += ' ' + text[i+j-1];
                    keys[j][s] = (keys[j][s] || 0) + 1;
                } else {
                    break;
                }
            }
        }
    
        let results = [];
    
        for (i = 1; i <= this.options.N_GRAM_MAX_WORDS; i++) {
            key = keys[i];
            for (j in key) {
                if (key[j] >= this.options.N_GRAM_MIN_OCCURRENCES && results.indexOf(j) < 0) {
                    results.push(j);
                }
            }
        }
    
        return results;
    }
}
