export class TfIdfItem {
    id!: number;
    word: string;
    score: number;

    constructor(id: number, word: string, score: number) {
        this.id = id;
        this.word = word;
        this.score = score;
    }
}