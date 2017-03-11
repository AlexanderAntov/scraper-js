module.exports = function () {
    return {
        get: function (data) {
            return {
                title: data.title,
                shortInfo: data.shortInfo,
                url: data.url,
                image: data.image,
                dateTime: data.dateTime,
                provider: data.provider
            };
        }
    };
};