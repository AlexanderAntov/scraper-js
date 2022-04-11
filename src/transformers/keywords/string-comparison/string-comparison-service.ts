export class StringComparisonService {
    static getLevenshteinDistance(first: string, second: string): number {
        const firstLength: number = first.length;
        const secondLength: number = second.length;

        if (firstLength === 0) {
            return secondLength;
        }

        if (secondLength === 0) {
            return secondLength;
        }

        let i: number;
        let j: number;
        let previous: number;
        let value: number | null;
        let list: number[];

        if (firstLength > secondLength) {
            let temp: string;
            temp = first;
            first = second;
            second = temp;
        }

        list = new Array(firstLength + 1);
        for (i = 0; i <= firstLength; i++) {
            list[i] = i;
        }

        value = null;

        for (i = 1; i <= secondLength; i++) {
            previous = i;

            for (j = 1; j <= firstLength; j++) {
                if (second[i - 1] === first[j - 1]) {
                    value = list[j - 1];
                } else {
                    value = Math.min(list[j - 1] + 1, Math.min(previous + 1, list[j] + 1));
                }

                list[j - 1] = previous;
                previous = value;
            }

            list[firstLength] = previous;
        }

        return list[firstLength];
    }
}
