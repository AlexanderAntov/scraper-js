import { uniqueId } from 'lodash';

export class NewsModel {
    public id: number;
    public title: string;
    public info: string;
    public url: string;
    public image: string;
    public dateTime: Date;
    public provider: number;

    constructor(data: {
        id?: number,
        title: string,
        info: string,
        trimInfo?: boolean,
        url: string,
        image: string,
        dateTime: Date,
        provider: number
    }) {
        this.id = parseInt(uniqueId());
        this.title = data.title;
        this.info = data.trimInfo ? trim(data.info) : data.info;
        this.url = data.url;
        this.image = data.image;
        this.dateTime = data.dateTime;
        this.provider = data.provider;
    }

    getText(): string {
        return `${this.title}\n${this.info}\n`;
    }
}

const trim = (str: string, maxLength: number = 150): string => {
    if (maxLength && str && str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    return str;
};
