import * as _ from 'lodash';
import { apiConstants, httpService, newsModelFactory } from '../../common/common.js';
import mailerService from '../../common/mailer-service.js';

export default class KeywordsService {
    get(newsList, sendMail) {
        let wordsList = [],
            trimmedString,
            wordHashmap = [],
            repeatedItemsLength = 0,
            countMap = {};

        if (_.isEmpty(newsList)) {
            throw Error('no news have been provided for keyword evaluation');
        }

        newsList.forEach((item) => {
            item.title.split(' ').forEach((word) => {
                if (word && word.length > 3) {
                    trimmedString = word.replace(/[^a-zA-Zа-яА-Я]/g, '');
                    if (trimmedString) {
                        wordsList.push(trimmedString);
                    }
                }
            });

            if (item.shortInfo) {
                item.shortInfo.split(' ').forEach((word) => {
                    if (word && word.length > 3) {
                        trimmedString = word.replace(/[^a-zA-Zа-яА-Я]/g, '');
                        if (trimmedString) {
                            wordsList.push(trimmedString);
                        }
                    }
                });
            }

            evalWordWeight(wordsList, item, _.findIndex(newsList, item));
            wordsList = [];
        });

        function evalWordWeight(list, newsModel, newsModelIndex) {
            let currentItem;
            for (let i = 0; i < list.length; i++) {
                currentItem = list[i];
                evalWordCount(currentItem);
                updateRepeatedItemsList(currentItem);
                evalPhrase(currentItem, i, 1);
            }
            
            function evalWordCount(word) {
                if (countMap[word] >= 1) {
                    countMap[word] = countMap[word] + 1;
                } else {
                    countMap[word] = 1;
                }
                return countMap[word];
            }
            
            function updateRepeatedItemsList(word, weight) {
                let wordIndex,
                    currentWeight;
                if (countMap[word] > 1) {
                    wordIndex = _.findIndex(wordHashmap, { value: word });
                    if (wordIndex > -1) {
                        currentWeight = weight || getItemWeightModel(word, countMap[word]).weight;
                        wordHashmap[wordIndex].count = countMap[word];
                        wordHashmap[wordIndex].weight = currentWeight;
                        wordHashmap[wordIndex].sourceArticles.push(newsModelIndex);
                    } else {
                        currentWeight = weight || getItemWeightModel(word, countMap[word]).weight;
                        wordHashmap.push({
                            value: word,
                            count: countMap[word],
                            weight: currentWeight,
                            sourceArticles: [newsModelIndex]
                        });
                    }
                }
                return wordIndex;
            }
            
            function evalPhrase(baseWord, startIndex, indexOffset) {
                let phrase = baseWord,
                    phraseContainedInTitle,
                    phraseContainedInShortInfo,
                    phraseWeight = 0,
                    phraseWeightModel,
                    phraseIndex,
                    endPhraseIndex = startIndex + indexOffset + 1;
                    
                for (let i = startIndex + 1; i < endPhraseIndex; i++) {
                    phrase += ' ' + list[i];
                }

                phraseWeightModel = getItemWeightModel(phrase, evalWordCount(phrase));
                phraseContainedInTitle = phraseWeightModel.containedInTitle;
                phraseContainedInShortInfo = phraseWeightModel.containedInShortInfo;
                phraseWeight = phraseWeightModel.weight;
                
                if (phraseContainedInTitle || phraseContainedInShortInfo) {
                    phraseIndex = updateRepeatedItemsList(phrase, phraseWeight);
                    if (phraseIndex > -1) {
                        wordHashmap[phraseIndex].weight += phraseWeight;
                    }
                    evalPhrase(baseWord, startIndex, ++indexOffset);
                }
            }
            
            //here is where the magic happens, play around with it
            function getItemWeightModel(item, count) {
                let weight = 0,
                    itemContainedInTitle,
                    itemContainedInShortInfo;
                    
                itemContainedInTitle = newsModel.title.indexOf(item) > -1;
                if (newsModel.shortInfo) {
                    itemContainedInShortInfo = newsModel.shortInfo.indexOf(item) > -1;
                } else {
                    itemContainedInShortInfo = false;
                }
                
                if (itemContainedInTitle && itemContainedInShortInfo) {
                    weight += 5;
                }
                if (item.indexOf(' ') > -1) {
                    weight += item.split(' ').length * 5;
                }
                
                return {
                    weight: weight + count,
                    containedInTitle: itemContainedInTitle,
                    containedInShortInfo: itemContainedInShortInfo
                };
            }
        }

        //add the weight (only for logging reasons)
        repeatedItemsLength = wordHashmap.length;
        for (let i = 0; i < repeatedItemsLength; i++) {
            wordHashmap[i].value = wordHashmap[i].value + ' ' + wordHashmap[i].weight;
        }

        let keywordsList = _.map(_.orderBy(wordHashmap, ['weight'], ['desc']), 'value');
        if (sendMail) {
            mailerService.send(
                'News keywords',
                keywordsList.join('\n')
            );
        }
        return keywordsList;
    }
}
