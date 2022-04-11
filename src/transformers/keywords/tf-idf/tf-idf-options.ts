export class TfIdfOptions {
    public minPhraseLength: number = 3;
    public titleKeywordMultiplier: number = 1.5;
    public longKeywordMultiplier: number | undefined;
    public capitalizedKeywordMultiplier: number | undefined;
    public topNewsScore: number = 1.5;
    public topNewsScoreStep: number = 0.1;
    public nGramMinOccurrences: number = 1;
    public nGramMaxWords: number = 5;
    public tfIdfScoreThreshold: number = 0.05;
    public thresholdStringDistance: number = 0;
    public thresholdStringDistanceLength: number = 0;
    public tfScoreModifier: Function;

    constructor({
        minPhraseLength,
        titleKeywordMultiplier,
        longKeywordMultiplier,
        capitalizedKeywordMultiplier,
        topNewsScore,
        topNewsScoreStep,
        nGramMinOccurrences,
        nGramMaxWords,
        tfIdfScoreThreshold,
        thresholdStringDistance,
        thresholdStringDistanceLength,
        tfScoreModifier
    }: {
        minPhraseLength?: number | undefined,
        titleKeywordMultiplier?: number | undefined,
        longKeywordMultiplier?: number | undefined,
        capitalizedKeywordMultiplier?: number | undefined,
        topNewsScore?: number | undefined,
        topNewsScoreStep?: number | undefined,
        nGramMinOccurrences?: number | undefined,
        nGramMaxWords?: number | undefined,
        tfIdfScoreThreshold?: number | undefined,
        thresholdStringDistance?: number | undefined,
        thresholdStringDistanceLength?: number | undefined,
        tfScoreModifier?: Function | undefined
    }) {
        this.minPhraseLength = minPhraseLength || 3;
        this.titleKeywordMultiplier = titleKeywordMultiplier || 1.5;
        this.longKeywordMultiplier = longKeywordMultiplier;
        this.capitalizedKeywordMultiplier = capitalizedKeywordMultiplier;
        this.topNewsScore = topNewsScore || 1.5;
        this.topNewsScoreStep = topNewsScoreStep || 0.1;
        this.nGramMinOccurrences = nGramMinOccurrences || 1;
        this.nGramMaxWords = nGramMaxWords || 5;
        this.tfIdfScoreThreshold = tfIdfScoreThreshold || 0.05;
        this.thresholdStringDistance = thresholdStringDistance || 0;
        this.thresholdStringDistanceLength = thresholdStringDistanceLength || 0;
        this.tfScoreModifier = tfScoreModifier;
    }
}
