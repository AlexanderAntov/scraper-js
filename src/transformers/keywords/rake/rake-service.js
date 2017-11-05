import stopWordsList from '../stopwords-const.js';

export default class RakeService {
	generate(text) {
		let phrasesList = this.generatePhrases(this.splitTextToSentences(text));
		return this.sortPhrases(
			this.calculatePhraseScores(
				phrasesList,
				this.calculateKeywordScores(phrasesList)
			)
		);
	}

	removeStopWords(sentence) {
        let stopwordsRegEx = '';
        for (let i in stopWordsList) {
            let stopword = stopWordsList[i];
            if (i !== stopWordsList.length - 1) {
                stopwordsRegEx = stopwordsRegEx + stopword + '|';
            }
            else {
                stopwordsRegEx = stopwordsRegEx + stopword;
            }
        }
		return sentence.replace(
			new RegExp('\\b(?:' + stopwordsRegEx.substring(0, stopwordsRegEx.length - 1) + ')\\b', 'ig'), '|'
		).split('|')
	}

	splitTextToSentences(text) {
		let sentences = text.match(/[^\.!\?\:\\]+/g),
			filteredSentencesList = [];
		for (let i in sentences) {
			let sentence = sentences[i].replace(/  +/g, '');
			if (sentence != '') {
				filteredSentencesList.push(sentence);
			}
		}
		return filteredSentencesList
	}


	generatePhrases(sentenceList) {
		let phraseList = [];
		for (let sentence in sentenceList) {
			let phrases = this.removeStopWords(sentenceList[sentence]);
			for (let phrase in phrases) {
				let temp = phrases[phrase].replace(/['!"“”’#$%&()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, '');
				if (temp !== ' ' && temp !== '') {
					phraseList.push(temp.trim());
				}
			}
		}
		return phraseList
	}

	calculateKeywordScores(phraseList) {
		let wordFrequency = {},
			wordDegree = {},
			wordScore = {};
		for (let phrase in phraseList) {
			let wordList = phraseList[phrase].match(/[,.!?;:/‘’“”]|\b[0-9a-z']+\b/gi);
			for (let word in wordList) {
				wordFrequency[wordList[word]] = 0;
				wordFrequency[wordList[word]] += 1;
				wordDegree[wordList[word]] = 0;
				wordDegree[wordList[word]] += wordList.length;
			}
		}

		for (let i in wordFrequency) {
			let frequency = wordFrequency[i];
			wordDegree[frequency] = wordDegree[frequency] + wordFrequency[frequency];
		}

		for (let i in wordFrequency) {
			wordScore[i] = 0;
			wordScore[i] = wordDegree[i] / (wordFrequency[i] * 1.0);
		}
		return wordScore
	}

	calculatePhraseScores(phraseList, wordScore) {
		let phraseScores = {};
		for (let phrase in phraseList) {
			let temp = phraseList[phrase];
			phraseScores[temp] = 0;
			let wordList = temp.match(/(\b[^\s]+\b)/g),
				candidateScore = 0;
			for (let word in wordList) {
				candidateScore += wordScore[wordList[word]];
			}
			phraseScores[temp] = candidateScore;
		}
		return phraseScores;
	}

	sortPhrases(obj) {
		let keys = [];
		for (let key in obj) {
			keys.push(key);
		}
		return keys.sort((a, b) => { return obj[b] - obj[a] });
	}
}
