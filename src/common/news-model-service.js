export class NewsModelService {
    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static trim(str, maxLength = 150) {
        if (maxLength && str && str.length > maxLength) {
            return str.substring(0, maxLength) + '...';
        }
        return str;
    }
}