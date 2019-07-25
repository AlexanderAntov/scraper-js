import { fakeNewsFilterConst } from './fake-news-filter.const.js';

class FakeNewsFilterService {
    isClickBait(text) {
        const lowerCaseText = text.toLowerCase();
        let textIsClickBait = false;
        fakeNewsFilterConst.clickBaitWords.forEach((keyword) => {
            if (lowerCaseText.indexOf(keyword) > -1) {
                textIsClickBait = true;
                return null;
            }
        });
        return textIsClickBait;
    }
}

export const fakeNewsFilterService = new FakeNewsFilterService();
