import { Dictionary } from '../../../common/dictionary';
import { TfIdfOptions } from './tf-idf-options';
import { TfIdfItem } from './tf-idf-item-model';
import { NewsModel } from '../../../common/news-model';
import { stopWordsList } from '../stopwords-const.js';
import uniqueId from 'lodash/uniqueId';

export class TfIdfCoreService {
    private options: TfIdfOptions;

    constructor(options: any) {
        this.options = new TfIdfOptions(options);
    }

    get(modelsList: NewsModel[]): TfIdfItem[] {
        const tfMap: Dictionary<any[]> = {};
        const idfMap: Dictionary<number> = {};
        const tfIdfMap: TfIdfItem[] = [];
        const modelsListLength: number = modelsList.length;
        let frequencyShouldBeEvaluated: boolean;
        let i: number;
        let j: number;

        for (i = 0; i < modelsListLength; i++) {
            const textItemWords = this.generateNGrams(this.normalizeText(modelsList[i].getText()));
            const textItemWordsLength = textItemWords.length;

            for (j = 0; j < textItemWordsLength; j++) {
                textItemWords[j] = textItemWords[j].trim();
                if (textItemWords[j] && textItemWords[j].length > this.options.minPhraseLength) {
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
            const isScoreValid = !this.options.tfIdfScoreThreshold || score > this.options.tfIdfScoreThreshold;
            if (isScoreValid) {
                tfIdfMap.push(new TfIdfItem(
                    parseInt(uniqueId()),
                    wordList[i],
                    score
                ));
            }
        }

        return tfIdfMap;

        function evalFrequency(model: NewsModel, word: string, options: TfIdfOptions, textItemWordsLength: number) {
            const wordOccurrenceCount = evalWordCount(model.getText(), word);
            let tfScore = wordOccurrenceCount / textItemWordsLength;

            idfMap[word] = idfMap[word] ? idfMap[word] + wordOccurrenceCount : wordOccurrenceCount;

            if (options.tfScoreModifier) {
                tfScore = options.tfScoreModifier(tfScore, model, word);
            }

            tfMap[word].push(tfScore);
        }

        function evalWordCount(text: string = '', word: string = '') {
            const wordLength: number = word.length;
            if (wordLength <= 0) {
                return (text.length + 1)
            }

            let count: number = 0;
            let position: number = 0;

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

    normalizeText(text: string): string {
        const stopWordsListLength: number = stopWordsList.length;
        let stopwordsRegEx: string = '';
        let i: number;

        for (i = 0; i < stopWordsListLength; i++) {
            stopwordsRegEx = `${stopwordsRegEx}${stopWordsList[i]}|`;
        }

        return text.replace(
                new RegExp('\\b(?:' + stopwordsRegEx.substring(0, stopwordsRegEx.length - 1) + ')\\b', 'ig'), ' '
            )
            .replace(/['!"“”’#$%&()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, '')
            .replace(/\n/g, ' ')
            .replace(/[0-9]/g, ' ');
    }

    generateNGrams(text: string): string[] {
        let keys: any[] = [null];
        let key: any;
        let i: number;
        let j: number;
        let s: string;
    
        for (i = 1; i <= this.options.nGramMaxWords; i++) {
            keys.push({});
        }
    
        let splittedText: string[] = text.split(/\s+/);
        const textLength: number = splittedText.length;
    
        for (i = 0; i < textLength; i++) {
            s = splittedText[i];
            keys[1][s] = (keys[1][s] || 0) + 1;
    
            for (j = 2; j <= this.options.nGramMaxWords; j++) {
                if (i + j <= textLength) {
                    s += ' ' + splittedText[i + j - 1];
                    keys[j][s] = (keys[j][s] || 0) + 1;
                } else {
                    break;
                }
            }
        }
    
        const results: string[] = [];
        let k: string;
    
        for (i = 1; i <= this.options.nGramMaxWords; i++) {
            key = keys[i];
            for (k in key) {
                if (key[k] >= this.options.nGramMinOccurrences && results.indexOf(k) < 0) {
                    results.push(k);
                }
            }
        }
    
        return results;
    }
}
