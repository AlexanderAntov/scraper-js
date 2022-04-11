import { fakeNewsFilterConst } from './fake-news-filter.const';

class FakeNewsFilterService {
    isClickBait(text: string): boolean {
        const lowerCaseText: string = text.toLowerCase();
        let textIsClickBait: boolean = false;
        fakeNewsFilterConst.clickBaitWords.forEach((keyword: string) => {
            if (lowerCaseText.indexOf(keyword) > -1) {
                textIsClickBait = true;
                return null;
            }
        });
        return textIsClickBait;
    }
}

export const fakeNewsFilterService = new FakeNewsFilterService();
