export class FlKnReadabilityService {
	static getScore(text) {
        const wordCount = FlKnReadabilityService._getWordCount(text),
            sentencesCount = FlKnReadabilityService._getSentencesCount(text),
            syllablesCount = FlKnReadabilityService._getSyllables(text);

        return 206.835 - 
            1.015 * (wordCount / sentencesCount) - 
            84.6 * (syllablesCount / wordCount);
    }
    
    static _getWordCount(text) {
        return text.replace(/(^\s*)|(\s*$)/gi, '')
            .replace(/[ ]{2,}/gi, ' ')
            .replace(/\n /, '\n')
            .split(' ').length;
    }

    static _getSentencesCount(text) {
        return text.split('.').length;
    }

    static _getSyllables(text) {
        let localText = text.toLowerCase();
        if (localText.length <= 3) { 
            return 1; 
        }

        return localText.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
            .replace(/^y/, '')
            .match(/[aeiouy]{1,2}/g).length;
    }
}
