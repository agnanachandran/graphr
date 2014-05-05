module.exports = function(app, factory) {

    // GET request to any URL
    app.get('/', function(req, res) {
        res.sendfile('./app/index.html');
    });

    app.get('/graph/alpha', function(req, res) {
        var resp = factory.getGraph({name:'AlphaBetaGamma'}, res);
    });
};
