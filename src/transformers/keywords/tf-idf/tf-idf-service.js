import { isFunction } from 'lodash';
import stopWordsList from '../stopwords-const.js';

export default class TfIdfService {
    constructor(options = {}) {
        this.options = options;
    }

    get(modelsList) {
        let tfMap = {},
            idfMap = {},
            tfIdfMap = [];

        modelsList.forEach((model, index) => {
            let textItemWords = this.generateNGrams(this.normalizeText(model.getText())),
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
            const score = (tfMap[word].reduce((x, y) => { return x + y }) / tfMap[word].length) * idfMap[word],
                isScoreValid = !this.options.TF_IDF_SCORE_THRESHOLD || (score > this.options.TF_IDF_SCORE_THRESHOLD);
            if (isScoreValid) {
                tfIdfMap.push({
                    word: word,
                    score: score
                });
            }
        });

        return tfIdfMap;

        function evalFrequency(model, word, options, textItemWordsLength) {
            const wordOccurrenceCount = evalWordCount(model.getText(), word);
            let tfScore = wordOccurrenceCount / textItemWordsLength;

            idfMap[word] = idfMap[word] ? idfMap[word] + wordOccurrenceCount : wordOccurrenceCount;

            if (isFunction(options.TF_SCORE_MODIFIER)) {
                tfScore = options.TF_SCORE_MODIFIER(tfScore, model, word);
            }

            tfMap[word].push(tfScore);
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
