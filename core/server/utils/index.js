var utils;

utils = {
    isDevMode: function (app) {
        return app.get('env') === 'development';
    }
}

module.exports = utils;