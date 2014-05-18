var app = angular.module('MainCtrl', []);
app.controller('MainController', ['$scope', 'Graph', function($scope, graphService) {
    $scope.tagLine = 'Graph anything.';

    $scope.resetClicks = function() {
        $scope.selectedNode = -1;
        $scope.doubleClickedNode = -1;
    }

    $scope.updateFrozenNodes = function() {
        var datasetNodes = $scope.dataset.nodes;
        for (var i = 0, len = datasetNodes.length; i < len; i++) {
            datasetNodes[i].fixed = $scope.areNodesFrozen; 
        }
    }

    $scope.freezeNodes = function(checkValue) {
        $scope.areNodesFrozen = checkValue;
        $scope.updateFrozenNodes();
    }

    $scope.connectNodes = function(n1, n2) {
        $scope.resetClicks();
        for (var i = 0, len = $scope.dataset.edges.length; i < len; i++) {
            var edge = $scope.dataset.edges[i];
            if (edge.source === n1 && edge.target === n2 || edge.target === n1 && edge.source === n2) {
                return;
            }
        }
        $scope.dataset.edges.push({source: n1, target: n2, weight: 1});
        $scope.update();
    }

    $scope.changeDataset = function(graph) {
        if (graph) {
            $scope.dataset = graph;
            $scope.selectedNode = -1;
            $scope.updateFrozenNodes();
            $scope.update();
        }
    };

    $scope.saveDataset = function() {
        graphService.create($scope.dataset).then(function(result) {
            // Successfully saved? Check result?
            console.log('YAY IT SAVED.' + result);
        });
    };

    $scope.alertClickedNode = function(d, i) {
        if ($scope.selectedNode === i) {
            if ($scope.doubleClickedNode >= 0) {
                if ($scope.doubleClickedNode != $scope.selectedNode) { // Prevent self-loops.
                    $scope.connectNodes($scope.doubleClickedNode, $scope.selectedNode);
                }
            } else {
                $scope.doubleClickedNode = i;
            }
        }
        $scope.selectedNode = i;
        $scope.update();
    };

    $scope.dataset = {
        name: "",
        nodes: [],
        edges: []
    };
    //graphService.get('DefaultGraph').then(function(result) {
        //$scope.dataset = result.data[0];
    //});

    graphService.getAll().then(function(result) {
        $scope.graphList = result.data;
    });

    $scope.algorithms = [
        {name: "Breadth-first Search"},
        {name: "Depth-first Search"},
        {name: "Dijkstra's Algorithm"},
        {name: "A* Search"},
    ];

    $scope.resetClicks();

}]);

app.directive('pzGraphVis', function() {
    return {
        restrict: 'E',
        replace: false,
        scope: false,
        link: function(scope, el, attrs) {
            // Setup
            // TODO: only run this after graph has been retrieved. Can perhaps be done by wrapping everything here in a function and assigning it to scope.run, and calling it in the callback above.
            var graphList = scope.graphList;

            function calculateWidth() {
                return window.innerWidth || e.clientWidth || g.clientWidth;
            }

            function calculateHeight() {
                return (window.innerHeight|| e.clientHeight|| g.clientHeight) - $('#footer-container').height() - $('nav').height() - 15;
            }

            var WIDTH = calculateWidth();
            var HEIGHT = calculateHeight();
            var MAX_NUMBER_OF_NODES = 60;

            // Calculate max weight for weightScale
            // TODO: update this since we're adding nodes now
            var maxWeight = 1;
            for (var i = 0, len = scope.dataset.edges.length; i < len; i++) {
                if (scope.dataset.edges[i].weight > maxWeight) {
                    maxWeight = scope.dataset.edges[i].weight;
                }
            }

            // Map weights to pixel values with a scale
            var weightScale = d3.scale.linear()
                .domain([0, maxWeight])
                .range([200, 400]); // TODO: this should also depend on the number of nodes present (make both elements smaller)

            var nodeRadiusScale = d3.scale.linear()
                .domain([1, MAX_NUMBER_OF_NODES])
                .range([100, 15]);

            var svg = d3.select(el[0]).append('svg:svg')
                .attr("width", WIDTH)
                .attr("height", HEIGHT);
                // Commented out zooming behaviour
                //.attr("pointer-events", "all")
                //.call(d3.behavior.zoom().on("zoom", redraw))
                //.append('svg:g');

            function updateWindow(){
                WIDTH = calculateWidth();
                HEIGHT = calculateHeight();
                svg.attr("width", WIDTH).attr("height", HEIGHT);
                forceLayout.size([WIDTH, HEIGHT]);
            }

            window.onresize = updateWindow;

            //function redraw() {
                //svg.attr("transform",
                    //"translate(" + d3.event.translate + ")"
                    //+ " scale(" + d3.event.scale + ")");
            //}

            var forceLayout = d3.layout.force()
                .size([WIDTH, HEIGHT])
                .charge([-2000])
                .nodes(scope.dataset.nodes)
                .links(scope.dataset.edges);

            function addNode(e) {
                if (scope.dataset.nodes.length < MAX_NUMBER_OF_NODES) { // No more nodes allowed
                    var node = {name: '#' + scope.dataset.nodes.length, fixed: scope.areNodesFrozen};
                    var point = d3.mouse(e);
                    node.x = point[0];
                    node.y = point[1];

                    scope.dataset.nodes.push(node);
                    update();

                    //scope.dataset.edges.push({source: scope.dataset.nodes.length - 1, target: Math.floor(Math.random() * (scope.dataset.nodes.length - 1)), weight: Math.ceil(Math.random()*10)});
                }
            }

            svg.on('click', function () {
                addNode(this);
            })

            function update() {
                // TODO: make new links somehow draw below the nodes so that edges don't appear on top of nodes
                forceLayout.nodes(scope.dataset.nodes).links(scope.dataset.edges);
                if (scope.dataset.nodes.length) {
                    $("#tutorial-container").fadeOut("medium");
                }

                var edges = svg.selectAll('line')
                    .data(forceLayout.links());

                edges.enter()
                    .append('line')
                    .attr('class', 'link');

                edges.style('stroke', '#bbb')
                    .style("stroke-dasharray", ("4, 4"))
                    .style('stroke-width', 1);

                edges.exit().remove();

                var nodes = svg.selectAll('circle')
                    .data(forceLayout.nodes());
                nodes.enter()
                    .append('circle')
                    .call(forceLayout.drag);

                nodes
                    .attr('class', 'node')
                    .attr('id', function(d, i) {
                        return 'node_' + i;
                    })
                    .style('fill', '#fefefe')
                    .style('stroke', '#111')
                    .style('stroke-width', function(d, i) {
                        return i === scope.selectedNode ? 2 : 1;
                    })
                    .transition().duration(1500).ease('elastic')
                    .attr('r', function(d, i) {
                        return nodeRadiusScale(scope.dataset.nodes.length);
                    });

                nodes.exit().remove();

                function nodeClick(d, i) {
                    // TODO: move these to somewhere where they'll be called on option change
                    if (d3.event.shiftKey) {
                        scope.dataset.nodes.splice(i, 1);
                        var j = 0;
                        while (j < scope.dataset.edges.length) {
                            if (scope.dataset.edges[j].source.index === i || scope.dataset.edges[j].target.index === i) {
                                scope.dataset.edges.splice(j, 1);
                            } else {
                                j++;
                            }
                        }
                        update();
                    } else {
                        scope.alertClickedNode(d,i);
                    }
                    d3.event.stopPropagation();
                }

                nodes.on('click', function(d,i) {
                    nodeClick(d, i);
                });

                var nodeInnerLabels = svg.selectAll('g.nodelabelholder')
                    .data(forceLayout.nodes());
                nodeInnerLabels.call(forceLayout.drag);
                nodeInnerLabels
                    .enter()
                    .append('g')
                    .attr('class', 'nodelabelholder')
                    .append('text')
                    .attr('class','nodelabel')
                    .attr('text-anchor', 'middle')
                    .attr("dy", ".35em")
                    .text(function(d, i) { return d.name; })
                    .on('click', function(d, i) {
                        nodeClick(d, i);
                    });
                nodeInnerLabels.exit().remove(); // TODO: make it fade out nicely?
                // TODO: make nodeText and linkText scales. Also transition().

                var linkText = svg.selectAll("g.linklabelholder")
                    .data(forceLayout.links());
                linkText.enter().append("g").attr("class", "linklabelholder")
                    .append("text")
                    .attr("class", "linklabel")
                    .attr("dx", 1)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .style("font-size", "20px")
                    .on('click', function(d, i) {
                        d3.event.stopPropagation();
                        //alert(i);
                        //scope.dataset.edges[i].weight = 3;
                        d.weight *= 2;
                        update();
                    })
                    .text(function(d) { 
                        return d.weight; 
                    })
                    .attr('id', function(d, i) {
                        return "link_text_" + i;
                    });
                    for (var i = 0, len = scope.dataset.edges.length; i < len; i++) {
                        var edge = scope.dataset.edges[i];
                        d3.select('text#link_text_' + i).text(edge.weight);
                    }
                linkText.exit().remove();

                forceLayout.linkDistance(function(d, i) {
                    return weightScale(d.weight);
                });

                forceLayout.start();
                forceLayout.on('tick', function() {
                    edges.attr('x1', function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    var r = nodeRadiusScale(scope.dataset.nodes.length);
                    nodes.attr("cx", function(d) {
                        return d.x = Math.max(r, Math.min(WIDTH - r, d.x));
                    })
                    .attr("cy", function(d) {
                        return d.y = Math.max(r, Math.min(HEIGHT - r, d.y));
                    });

                    nodeInnerLabels.attr('transform', function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                    // link label
                    linkText.attr("transform", function(d) {
                        return "translate(" + (d.source.x + d.target.x) / 2 + "," 
                        + (d.source.y + d.target.y) / 2 + ")"; 
                    });
                });
            }

            update();
            scope.update = update;
            //scope.forceLayout = forceLayout;

        }
    };
});
