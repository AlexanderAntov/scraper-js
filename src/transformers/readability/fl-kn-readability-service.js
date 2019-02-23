export default class FlKnReadabilityService {
	getScore(text) {
        const wordCount = this.getWordCount(text),
            sentencesCount = this.getSentencesCount(text),
            syllablesCount = this.getSyllables(text);

        return 206.835 - 
            1.015 * (wordCount / sentencesCount) - 
            84.6 * (syllablesCount / wordCount);
    }
    
    getWordCount(text) {
        return text.replace(/(^\s*)|(\s*$)/gi, '')
            .replace(/[ ]{2,}/gi, ' ')
            .replace(/\n /, '\n')
            .split(' ').length;
    }

    getSentencesCount(text) {
        return text.split('.').length;
    }

    getSyllables(text) {
        let localText = text.toLowerCase();
        if (localText.length <= 3) { 
            return 1; 
        }

        return localText.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
            .replace(/^y/, '')
            .match(/[aeiouy]{1,2}/g).length;
    }
}
