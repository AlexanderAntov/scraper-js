import { isEmpty } from 'lodash';

export default class NewsModelService {
    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static trim(str) {
        return str && str.length > 150 ? str.substring(0, 150) + '...' : str;
    }

    static textDoesNotContainFakeNewsKeywords(fakeNewsBlacklistKeywords, text) {
        let textIsClean = true;
        if (!isEmpty(fakeNewsBlacklistKeywords)) {
            fakeNewsBlacklistKeywords.forEach((keyword) => {
                if (text.indexOf(keyword) > -1) {
                    textIsClean = false;
                    return null;
                }
            });
        }
        return textIsClean;
    }
}