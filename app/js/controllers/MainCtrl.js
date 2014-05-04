var app = angular.module('MainCtrl', []);
app.controller('MainController', function($scope) {
    $scope.tagLine = 'Graph anything.';
    $scope.dataset = {
        nodes: [
            { name: 'Alice'},
            { name: 'Bob'},
            { name: 'Candice'},
            { name: 'Diane'},
            { name: 'Erica'},
            { name: 'Ford'},
            { name: 'Gary'},
            { name: 'Henry'}
        ],
        edges: [
            { source: 0, target: 1, weight: 1},
            { source: 0, target: 3, weight: 3},
            { source: 0, target: 2, weight: 5},
            { source: 4, target: 5, weight: 7},
            { source: 5, target: 6, weight: 2},
            { source: 2, target: 3, weight: 3}
        ]
    };
    $scope.freezeNodes = function(checkValue) {
        var datasetNodes = $scope.dataset.nodes;
        if (checkValue) {
            for (var i = 0, len = datasetNodes.length; i < len; i++) {
               datasetNodes[i].fixed = true; 
            }
        } else {
            for (var i = 0, len = datasetNodes.length; i < len; i++) {
               datasetNodes[i].fixed = false; 
            }
        }
    }
});

app.directive('pzGraphVis', function() {
    return {
        restrict: 'E',
        replace: false,
        scope: {dataset: '=graphData'},
        link: function(scope, el, attrs) {
            // Setup
            var dataset = scope.dataset;
            var WIDTH = 1680;
            var HEIGHT = 800;
            var MAX_NUMBER_OF_NODES = 20;

            // Calculate max weight for weightScale
            var maxWeight = 1;
            for (var i = 0, len = dataset.edges.length; i < len; i++) {
                if (dataset.edges[i].weight > maxWeight) {
                    maxWeight = dataset.edges[i].weight;
                }
            }

            // Map weights to pixel values with a scale
            var weightScale = d3.scale.linear()
                .domain([0, maxWeight])
                .range([70, 300]);

            var nodeRadiusScale = d3.scale.linear()
                .domain([1, MAX_NUMBER_OF_NODES])
                .range([65, 5]);

            var svg = d3.select(el[0]).append('svg'); // Append svg element

            svg.attr('width', WIDTH);
            svg.attr('height', HEIGHT);

            var forceLayout = d3.layout.force()
                .nodes(dataset.nodes)
                .links(dataset.edges)
                .size([WIDTH, HEIGHT])
                .linkDistance(function(d, i) {
                    return weightScale(d.weight);
                })
                .charge([-1000])
                .start();

            var edges = svg.selectAll('line')
                .data(dataset.edges)
                .enter()
                .append('line')
                .style('stroke', '#bbb')
                .style("stroke-dasharray", ("4, 4"))
                .style('stroke-width', 1);

            var nodes = svg.selectAll('circle')
                .data(dataset.nodes)
                .enter()
                .append('circle')
                .attr('r', function(d, i) {
                    return nodeRadiusScale(dataset.nodes.length);
                })
                .attr('class', function() {
                    return 'node';
                })
                .attr('id', function(d, i) {
                    return 'node_' + i;
                })
                .style('fill', '#fefefe')
                .style('stroke', '#111')
                .style('stroke-width', 1)
                .call(forceLayout.drag);

            var textLabels = svg.selectAll('text.label')
                .data(dataset.nodes)
                .enter()
                .append('text')
                .attr('text-anchor', 'middle')
                .attr("dy", ".35em")
                .text(function(d, i) {
                    return d.name;
                });

                var linktext = svg.selectAll("g.linklabelholder").data(dataset.edges);
                linktext.enter().append("g").attr("class", "linklabelholder")
                .append("text")
                .attr("class", "linklabel")
                .attr("dx", 1)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.weight; });

            nodes.on('click', function() {
                $("#tutorial-container").fadeOut("medium");
            });

            forceLayout.on('tick', function() {
                edges.attr('x1', function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

                nodes.attr('cx', function(d) { return d.x; })
                    .attr('cy', function(d) { return d.y; });
                
                textLabels.attr('transform', function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

                // link label
                linktext.attr("transform", function(d) {
                    return "translate(" + (d.source.x + d.target.x) / 2 + "," 
                    + (d.source.y + d.target.y) / 2 + ")"; 
                });
            });

        }
    };
});
