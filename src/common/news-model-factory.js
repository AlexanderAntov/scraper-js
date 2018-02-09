import * as _ from 'lodash';

class NewsModel {
    constructor(data = {}) {
        this.id = parseInt(_.uniqueId());
        this.title = data.title;
        this.info = data.info;
        this.url = data.url;
        this.image = data.image;
        this.dateTime = data.dateTime;
        this.provider = data.provider;
    }

    getText() {
        return this.title + '\n' + this.info + '\n';
    }
}

export default class NewsModelFactory {
    static get(data) {
        return new NewsModel(data);
    }
}