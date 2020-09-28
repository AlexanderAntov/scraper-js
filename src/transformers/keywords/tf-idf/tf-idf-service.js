import { isFunction, uniqueId } from 'lodash';
import { stopWordsList } from '../stopwords-const.js';
import { TfIdfOptions } from './tf-idf-options.js';

export class TfIdfService {
    constructor(options) {
        this.options = new TfIdfOptions(options);
    }

    get(modelsList) {
        const tfMap = {};
        const idfMap = {};
        const tfIdfMap = [];
        const modelsListLength = modelsList.length;
        let frequencyShouldBeEvaluated;
        let i;
        let j;

        for (i = 0; i < modelsListLength; i++) {
            const textItemWords = this.generateNGrams(this.normalizeText(modelsList[i].getText()));
            const textItemWordsLength = textItemWords.length;

            for (j = 0; j < textItemWordsLength; j++) {
                textItemWords[j] = textItemWords[j].trim();
                if (textItemWords[j] && textItemWords[j].length > this.options.MIN_PHRASE_LENGTH) {
                    frequencyShouldBeEvaluated = false;
                    if (!tfMap[textItemWords[j]]) {
                        tfMap[textItemWords[j]] = [];
                        frequencyShouldBeEvaluated = true;
                    } else if (tfMap[textItemWords[j]].length < i + 1) {
                        frequencyShouldBeEvaluated = true;
                    }

                    if (frequencyShouldBeEvaluated) {
                        evalFrequency(
                            modelsList[i],
                            textItemWords[j],
                            this.options,
                            textItemWordsLength
                        );
                    }
                }
            }
        }

        const wordList = Object.keys(tfMap);
        const wordListLength = wordList.length;

        for (i = 0; i < wordListLength; i++) {
            const scoreSum = tfMap[wordList[i]].reduce((x, y) => { return x + y });
            const score = scoreSum / tfMap[wordList[i]].length * idfMap[wordList[i]];
            const isScoreValid = !this.options.TF_IDF_SCORE_THRESHOLD || score > this.options.TF_IDF_SCORE_THRESHOLD;
            if (isScoreValid) {
                tfIdfMap.push({
                    id: parseInt(uniqueId()),
                    word: wordList[i],
                    score: score
                });
            }
        }

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
            const wordLength = word.length;
            if (wordLength <= 0) {
                return (text.length + 1)
            }

            let count = 0;
            let position = 0;

            while (true) {
                position = text.indexOf(word, position);
                if (position >= 0) {
                    ++count;
                    position += wordLength;
                } else {
                    break;
                }
            }

            return count;
        }
    }

    normalizeText(text) {
        let stopwordsRegEx = '';
        let i;
        let stopword;

        for (i in stopWordsList) {
            stopword = stopWordsList[i];
            if (i !== stopWordsList.length - 1) {
                stopwordsRegEx = `${stopwordsRegEx}${stopword}|`;;
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
        let keys = [null];
        let key;
        let i;
        let j;
        let s;
    
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
                    s += ' ' + text[i + j - 1];
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
