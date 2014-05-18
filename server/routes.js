module.exports = function(app, factory) {

    // GET request to any URL
    app.get('/', function(req, res) {
        res.sendfile('./app/index.html');
    });

    app.get('/graphs/:name', function(req, res) {
        var resp = factory.getGraph({name:req.params.id}, res);
    });

    app.get('/graphs/', function(req, res) {
        var resp = factory.getAllGraphs(res);
    })

};
