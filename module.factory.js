var Factory = function(Schema, mongoose) {
    this.Schema = Schema;
    this.mongoose = mongoose;

    this.createSchemas = function() {
        GraphSchema = new this.Schema({
            name: String,
            nodes: [{name: String}],
            edges: [{source: Number, target: Number, weight: Number}]
        });

        this.Graph = mongoose.model('Graph', GraphSchema);
    };

    this.insertGraphs = function() {
        //var defaultGraph = new this.Graph(
            //{
                //name: "DefaultGraph",
                //nodes: [
                    //{ name: 'Alice'},
                    //{ name: 'Bob'},
                    //{ name: 'Candice'},
                    //{ name: 'Diane'},
                    //{ name: 'Erica'},
                    //{ name: 'Ford'},
                    //{ name: 'Gary'},
                    //{ name: 'Henry'}
                //],
                //edges: [
                    //{ source: 0, target: 1, weight: 1},
                    //{ source: 0, target: 3, weight: 3},
                    //{ source: 0, target: 2, weight: 5},
                    //{ source: 4, target: 5, weight: 7},
                    //{ source: 5, target: 6, weight: 2},
                    //{ source: 2, target: 3, weight: 3}
                //]
            //}
        //);
        //defaultGraph.save();
    };

    this.getGraph = function(query, res) {
        this.Graph.find(query, function(error, output) {
            res.json(output);
        });
    };

    this.getAllGraphs = function(res) {
        this.Graph.find({}, function(error, output) {
            res.json(output);
        });
    };

    this.createGraph = function(graphData, res) {
        var graph = {};
        graph.name = "New graph" + graphData.nodes.length;
        graph.nodes = [];
        graph.edges = [];
        for (var i = 0, len = graphData.nodes.length; i < len; i++) {
            graph.nodes.push({name: graphData.nodes[i].name});
        }
        for (var i = 0, len = graphData.edges.length; i < len; i++) {
            var edge = graphData.edges[i];
            var src = edge.source.index;
            var tar = edge.target.index;
            var weight = edge.weight;
            graph.edges.push({
                source: src,
                target: tar,
                weight: weight
            });
        }
        var newGraph = new this.Graph(
            graph
        );
        newGraph.save(function (err) {
            if (!err) {
                console.log("updated");
            } else {
                console.log(err);
            }
            res.send(newGraph);
        });
    };

}

module.exports = Factory;
