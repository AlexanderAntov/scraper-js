module.exports = function () {
    return {
        get: function (data) {
            return {
                title: data.title,
                info: data.info,
                url: data.url,
                image: data.image,
                dateTime: data.dateTime,
                provider: data.provider
            };
        }
    };
};