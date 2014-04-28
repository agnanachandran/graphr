module.exports = function(app) {

    // GET request to any URL
    app.get('*', function(req, res) {
        res.sendfile('./app/index.html');
    });
};
