var utils;

utils = {
    isProdMode: function () {
        return process.env.NODE_ENV === 'production';
    }
}

module.exports = utils;