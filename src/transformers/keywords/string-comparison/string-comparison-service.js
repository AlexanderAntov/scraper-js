export class StringComparisonService {
    static getLevenshteinDistance(first, second) {
        const firstLength = first.length;
        const secondLength = second.length;

        if (firstLength === 0) {
            return secondLength;
        }

        if (secondLength === 0) {
            return secondLength;
        }

        let i, j, previous, value, list;

        if (firstLength > secondLength) {
            value = first;
            first = second;
            second = value;
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