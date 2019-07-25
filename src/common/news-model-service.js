import { isEmpty } from 'lodash';

export class NewsModelService {
    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static trim(str) {
        return str && str.length > 150 ? str.substring(0, 150) + '...' : str;
    }
}