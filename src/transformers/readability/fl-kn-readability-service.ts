export class FlKnReadabilityService {
	getScore(text: string): number {
        const wordCount: number = this.getWordCount(text);
        const sentencesCount: number = this.getSentencesCount(text);
        const syllablesCount: number = this.getSyllables(text);

        return 206.835 - 
            1.015 * (wordCount / sentencesCount) - 
            84.6 * (syllablesCount / wordCount);
    }
    
    private getWordCount(text: string): number {
        return text.replace(/(^\s*)|(\s*$)/gi, '')
            .replace(/[ ]{2,}/gi, ' ')
            .replace(/\n /, '\n')
            .split(' ').length;
    }

    private getSentencesCount(text: string): number {
        return text.split('.').length;
    }

    private getSyllables(text: string): number {
        let localText: string = text.toLowerCase();
        if (localText.length <= 3) { 
            return 1; 
        }

        return localText.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
            .replace(/^y/, '')
            .match(/[aeiouy]{1,2}/g).length;
    }
}

export const flKnReadabilityService = new FlKnReadabilityService();
