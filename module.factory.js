var Factory = function(Schema, mongoose) {
    this.Schema = Schema;
    this.mongoose = mongoose;
    this.Item = null;

    this.createSchemas = function() {
        GraphSchema = new this.Schema({
            name: String
        });

        this.Graph = mongoose.model('Graph', GraphSchema);
    };

    this.insertGraphs = function() {
        var alpha = new this.Graph({
            name: 'AlphaBetaGamma'
        });

        alpha.save();
    }

    this.getGraph = function(query, res) {
        this.Graph.find(query, function(error, output) {
            res.json(output);
        });
    };
}

module.exports = Factory;
