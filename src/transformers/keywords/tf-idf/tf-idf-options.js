export default class TfIdfOptions {
    constructor(data = {}) {
        this.MIN_PHRASE_LENGTH = data.MIN_PHRASE_LENGTH || 3;
        this.TF_SCORE_MODIFIER = data.TF_SCORE_MODIFIER || null;
        this.TITLE_KEYWORD_MULTIPLIER = data.TITLE_KEYWORD_MULTIPLIER || 1.5;
        this.LONG_KEYWORD_MULTIPLIER = data.LONG_KEYWORD_MULTIPLIER || null;
        this.CAPITALIZED_KEYWORDS_MULTIPLIER = data.CAPITALIZED_KEYWORDS_MULTIPLIER || null;
        this.TOP_NEWS_SCORE = data.TOP_NEWS_SCORE || 1.5;
        this.TOP_NEWS_SCORE_STEP = data.TOP_NEWS_SCORE_STEP || 0.1;
        this.N_GRAM_MIN_OCCURRENCES = data.N_GRAM_MIN_OCCURRENCES || 1;
        this.N_GRAM_MAX_WORDS = data.N_GRAM_MAX_WORDS || 5;
        this.TF_IDF_SCORE_THRESHOLD = data.TF_IDF_SCORE_THRESHOLD || 0.05;
        this.THRESHOLD_STRING_DISTANCE = data.THRESHOLD_STRING_DISTANCE || 0;
    }
}
