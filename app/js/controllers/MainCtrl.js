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

    $scope.alertClickedNode = function(d, i) {
        var datasetNodes = $scope.dataset.nodes;
        //datasetNodes[i].name = 'LOL';
        $scope.selectedNode = i;
    }
});

app.directive('pzGraphVis', function() {
    return {
        restrict: 'E',
        replace: false,
        scope: false,
        link: function(scope, el, attrs) {
            // Setup
            var dataset = scope.dataset;
            if (dataset) {
                $("#tutorial-container").fadeOut("medium");
            }
            var WIDTH = 1680;
            var HEIGHT = 800;
            var MAX_NUMBER_OF_NODES = 20;

            // Calculate max weight for weightScale
            // TODO: update this since we're adding nodes now
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
                .size([WIDTH, HEIGHT])
                .charge([-1000]);

            forceLayout.nodes(dataset.nodes);
            forceLayout.links(dataset.edges);
            var forceNodes = forceLayout.nodes();
            var forceLinks = forceLayout.links();

            function addNode() {
                forceNodes.push({name: 'LOL'});
                update();
            }

            setTimeout(function() {
                var a = {name: "a"}, b = {name: "b"}, c = {name: "c"};
                forceNodes.push(a,b,c);
                //dataset.edges.push({source: 0, target: 1}, {source: 3, target: 4}, {source: 5, target: 6});
                addNode();
            }, 3000);

            function update() {

                var edges = svg.selectAll('line')
                    .data(forceLinks);
                edges.enter()
                    .append('line')
                    .attr('class', 'link');

                edges.style('stroke', '#bbb')
                    .style("stroke-dasharray", ("4, 4"))
                    .style('stroke-width', 1);

                edges.exit().remove();

                var nodes = svg.selectAll('circle')
                    .data(forceNodes);
                nodes.enter()
                    .append('circle');
                nodes.attr('r', function(d, i) {
                        return nodeRadiusScale(forceNodes.length);
                    })
                    .attr('class', 'node')
                    .attr('id', function(d, i) {
                        return 'node_' + i;
                    })
                    .style('fill', '#fefefe')
                    .style('stroke', '#111')
                    .style('stroke-width', 1)
                    .call(forceLayout.drag);

                nodes.exit().remove();

                nodes.on('click', function(d,i) {
                    nodes.style('stroke-width', function(d, i) {
                        if (i === scope.selectedNode) {
                        return 1; 
                        }
                    });
                    scope.alertClickedNode(d,i);
                    nodes.style('stroke-width', function(d, i) {
                        if (i === scope.selectedNode) {
                        return 2; 
                        }
                    });
                    svg.selectAll('text.nodelabel').text(function(d, i) {
                        return d.name;
                    });
                });

                var nodeInnerLabels = svg.selectAll('g.nodelabelholder')
                    .data(forceNodes);
                nodeInnerLabels
                    .enter()
                    .append('g')
                    .attr('class', 'nodelabelholder')
                    .append('text')
                    .attr('class','nodelabel')
                    .attr('text-anchor', 'middle')
                    .attr("dy", ".35em")
                    .text(function(d, i) {
                        return d.name;
                    })
                    .call(forceLayout.drag);

                var linktext = svg.selectAll("g.linklabelholder").data(forceLinks);
                linktext.enter().append("g").attr("class", "linklabelholder")
                    .append("text")
                    .attr("class", "linklabel")
                    .attr("dx", 1)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .text(function(d) { return d.weight; });

                forceLayout.linkDistance(function(d, i) {
                    return weightScale(d.weight);
                });

                forceLayout.start();
                forceLayout.on('tick', function() {
                    edges.attr('x1', function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    nodes.attr('cx', function(d) { return d.x; })
                        .attr('cy', function(d) { return d.y; });

                //nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                
                    
                    nodeInnerLabels.attr('transform', function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                    // link label
                    linktext.attr("transform", function(d) {
                        return "translate(" + (d.source.x + d.target.x) / 2 + "," 
                        + (d.source.y + d.target.y) / 2 + ")"; 
                    });
                });
            }

            update();

        }
    };
});
