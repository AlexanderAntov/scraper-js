export default class TextRankSummarizationService {
    constructor() {
        this.graph = {
            vertexes: {},
            edges: {},
            vertexesCount: 0
        };
        this.delta = 0.0001;
        this.iterations = 0;
        this.iterateAgain = true;
        this.randomSerferConstant = 0.85;
    }

    get(text, sentences) {
        this.setUpGraph(text);
        this.iterate();
        return this.extractSummary(sentences);
    }

    setUpGraph(text) {
        this.graph.vertexes = this.processText(text);
        this.graph.vertexesCount = Object.keys(this.graph.vertexes).length;

        for (let iIndex in this.graph.vertexes) {
            let vertex = this.graph.vertexes[iIndex];

            vertex.score = Math.random() * 10 + 1;
            vertex.id = Number(iIndex);

            let Si = vertex;

            for (let j = 0; j < this.graph.vertexesCount; j++) {
                let jIndex = j.toString();

                if (jIndex !== iIndex) {
                    if (!this.graph.edges[iIndex]) {
                        this.graph.edges[iIndex] = {};
                    }

                    let Sj = this.graph.vertexes[jIndex];
                    this.graph.edges[iIndex][jIndex] = this.similarityScoring(Si, Sj);
                }
            }
        }
    }

    similarityScoring(Si, Sj) {
        let overlap = {}
        let Si_tokens = Si.tokens;
        let Sj_tokens = Sj.tokens;

        for (let i = 0; i < Si_tokens.length; i++) {
            let word = Si_tokens[i];

            if (!overlap[word]) {
                overlap[word] = {}
            }

            overlap[word]['i'] = 1;
        }

        for (let i = 0; i < Sj_tokens.length; i++) {
            let word = Sj_tokens[i];

            if (!overlap[word]) {
                overlap[word] = {}
            }
            overlap[word]['j'] = 1;
        }

        let logLengths = Math.log(Si_tokens.length) + Math.log(Sj_tokens.length);
        let wordOverlapCount = 0;

        for (let index in overlap) {
            let word = overlap[index]
            if (Object.keys(word).length === 2) {
                wordOverlapCount++;
            }
        }

        return wordOverlapCount / logLengths;
    }

    iterate() {
        for (let index in this.graph.vertexes) {
            let vertex = this.graph.vertexes[index],
                score_0 = vertex.score,
                vertexNeighbors = this.graph.edges[index],
                summedNeighbors = 0;

            for (let neighborIndex in vertexNeighbors) {
                let neighbor = vertexNeighbors[neighborIndex],
                    wji = this.graph.edges[index][neighborIndex],
                    outNeighbors = this.graph.edges[neighborIndex],
                    summedOutWeight = 1;

                for (let outIndex in outNeighbors) {
                    summedOutWeight += outNeighbors[outIndex];
                }

                let WSVertex = this.graph.vertexes[neighborIndex].score;
                summedNeighbors += (wji / summedOutWeight) * WSVertex;

            }

            let score_1 = (1 - this.randomSerferConstant) + this.randomSerferConstant * summedNeighbors;
            this.graph.vertexes[index].score = score_1;

            if (Math.abs(score_1 - score_0) <= this.delta) {
                this.iterateAgain = false;
            }

        }

        if (this.iterateAgain) {
            this.iterations += 1;
            this.iterate();
        }

        return;
    }

    extractSummary(sentencesCount) {
        let sentences = [];

        for (let index in this.graph.vertexes) {
            sentences.push(this.graph.vertexes[index]);
        }

        sentences = sentences.sort((a, b) => {
            if (a.score > b.score) {
                return -1;
            } else {
                return 1;
            }
        });

        sentences = sentences.slice(0, sentencesCount).sort((a, b) => {
            if (a.id < b.id) {
                return -1;
            } else {
                return 1;
            }
        });

        let summary = sentences[0].sentence;
        for (let i = 1; i < sentences.length; i++) {
            summary += ' ' + sentences[i].sentence;
        }

        return summary;
    }

    processText(article) {
        let cleanedArticle = article.replace(/[/s]+(?= )/g, '');
        let tokens = cleanTokens(
            cleanedArticle.replace(/([ ]['.A-Za-z-|0-9]+[!|.|?|'](?=[ ]['“A-Z]))/g, '$1|').split('|')
        );
        let output = {};
    
        for (let i = 0; i < tokens.length; i++) {
            let tokenizedSentence = tokenizeSentence(tokens[i]);
            output[i] = {
                sentence: tokens[i],
                tokens: tokenizedSentence
            };
        }
    
        return output;
    
        function cleanTokens(tokens) {
            for (let i = tokens.length - 1; i >= 0; i--) {
                let token = tokens[i]
    
                if (token === '') {
                    tokens.splice(i, 1);
                } else {
                    tokens[i] = token.replace(/[ .]*/, '')
                }
            }
    
            return tokens;
        }
    
        function tokenizeSentence(sentence) {
            return sentence.toLowerCase()
                .replace(/[-|'|'|(|)|/|<|>|,|:|;](?! )/g, ' ')
                .replace(/[-|'|'|(|)|/|<|>|,|:|;]/g, '').split(' ');
        }
    }
}