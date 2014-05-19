var app = angular.module('MainCtrl', []);
app.controller('MainController', ['$scope', 'Graph', function($scope, graphService) {
    $scope.tagLine = 'Graph anything.';

    $scope.resetClicks = function() {
        this.selectedNode = -1;
        this.doubleClickedNode = -1;
    }

    $scope.updateFrozenNodes = function() {
        var datasetNodes = this.dataset.nodes;
        for (var i = 0, len = datasetNodes.length; i < len; i++) {
            datasetNodes[i].fixed = this.areNodesFrozen; 
        }
    }

    $scope.updateNodeOrEdge = function(value) {
        if (this.selectedEdge >= 0 && !isNaN(value) && value < 9999) {
            this.calculateScalesWithNewWeight(value);
            this.dataset.edges[this.selectedEdge].weight = value;
            this.update();
        }
    }

    $scope.freezeNodes = function(checkValue) {
        this.areNodesFrozen = checkValue;
        this.updateFrozenNodes();
    }

    $scope.connectNodes = function(n1, n2) {
        this.resetClicks();
        for (var i = 0, len = this.dataset.edges.length; i < len; i++) {
            var edge = this.dataset.edges[i];
            if (edge.source.index === n1 && edge.target.index === n2 || edge.target.index === n1 && edge.source.index === n2) {
                return;
            }
        }
        this.dataset.edges.push({source: n1, target: n2, weight: 1});
        this.update();
    }

    $scope.changeDataset = function(graph) {
        if (graph) {
            this.dataset = graph;
            this.resetClicks();
            this.selectedEdge = -1;
            this.updateFrozenNodes();
            this.update();
        }
    };

    $scope.saveDataset = function(graphName) {
        // TODO: figure out more robust solution for saving and updating graphs.
        var newDataset = {
            name: "",
            nodes: [],
            edges: []
        };
        newDataset.name = graphName + ": " + new Date();
        newDataset.nodes = this.dataset.nodes;
        newDataset.edges = this.dataset.edges;

        graphService.create(newDataset).then(function(result) {
            // Successfully saved? Check result?
            if (result) {
                var $saveGraph = $('#save-graph');
                $saveGraph.html('Saved!');
                $saveGraph.attr('disabled', 'disabled');

                window.setTimeout(function () {
                    $saveGraph.html('Save');
                    $saveGraph.removeAttr('disabled');
                }, 1000);
            }
        });
    };

    $scope.alertClickedNode = function(d, i) {
        if (this.selectedNode === i) {
            if (this.doubleClickedNode >= 0) {
                if (this.doubleClickedNode != this.selectedNode) { // Prevent self-loops.
                    this.connectNodes(this.doubleClickedNode, this.selectedNode);
                }
            } else {
                this.doubleClickedNode = i;
            }
        }
        this.selectedNode = i;
        this.update();
    };

    $scope.alertClickedEdge = function(d, i) {
        this.edgeValue = this.dataset.edges[i].weight;
        var input = $('#edgeInput');
        input.val(this.edgeValue);
        this.selectedEdge = i;
    }

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
                return (window.innerHeight|| e.clientHeight|| g.clientHeight) - $('#footer-container').height() - $('nav').height() - 25;
            }

            var WIDTH = calculateWidth();
            var HEIGHT = calculateHeight();
            var MAX_NUMBER_OF_NODES = 60;

            function calculateMaxWeight() {
                var max = 1;
                for (var i = 0, len = scope.dataset.edges.length; i < len; i++) {
                    if (scope.dataset.edges[i].weight > max) {
                        max = scope.dataset.edges[i].weight;
                    }
                }
                return max;
            }

            var maxWeight;
            var weightScale;
            var counterForNewNode = 0;

            var calculateScalesWithNewWeight = function (newWeight) {
                if (newWeight > maxWeight) {
                    maxWeight = newWeight;
                }

                weightScale = d3.scale.linear()
                    .domain([0, maxWeight])
                    .range([250, 400]); // TODO: this should also depend on the number of nodes present (make both elements smaller)
            };

            function calculateScales() {
                maxWeight = calculateMaxWeight();

                // Map weights to pixel values with a scale
                weightScale = d3.scale.linear()
                    .domain([0, maxWeight])
                    .range([250, 400]); // TODO: this should also depend on the number of nodes present (make both elements smaller)
            }

            scope.calculateScalesWithNewWeight = calculateScalesWithNewWeight;
            
            calculateScales();

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
                    var node = {name: '#' + counterForNewNode++, fixed: scope.areNodesFrozen};
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

                var enteredNodes = nodes.enter()
                    .append('circle')
                    .call(forceLayout.drag);

                enteredNodes
                    .attr('r', 0)
                    .transition().duration(100).ease('easein')
                    .attr('r', function() {
                        return nodeRadiusScale(scope.dataset.nodes.length);
                    });

                nodes
                    .attr('class', 'node')
                    .attr('id', function(d, i) {
                        return 'node_' + i;
                    })
                    .style('fill', '#fefefe')
                    .style('stroke', '#111')
                    .transition().duration(300).ease('easein')
                    .style('stroke-width', function(d, i) {
                        return i === scope.selectedNode ? 2 : 1;
                    })
                    .attr('r', function() {
                        return nodeRadiusScale(scope.dataset.nodes.length);
                    });

                nodes.exit().remove()
                // TODO: add transition

                function nodeClick(d, i) {
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
                        scope.resetClicks();
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
                    .attr('id', function(d, i) {
                        return "node_text_" + i;
                    })
                    .on('click', function(d, i) {
                        nodeClick(d, i);
                    });
                nodeInnerLabels.exit().remove();

                for (var i = 0, len = scope.dataset.nodes.length; i < len; i++) {
                    var node = scope.dataset.nodes[i];
                    d3.select('text#node_text_' + i).text(node.name);
                }
                

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
                        if (d3.event.shiftKey) {
                            scope.dataset.edges.splice(i, 1);
                            if (i === scope.selectedEdge) {
                                scope.selectedEdge = -1;
                            }
                        } else {
                            scope.alertClickedEdge(d,i);
                        }
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
                    d3.select('text#link_text_' + i)
                        .text(edge.weight)
                        .style('fill', function() {
                            if (i === scope.selectedEdge) {
                                return "#f00";
                            } else {
                                return "#000";
                            }
                        });
                }
                linkText.exit().remove();

                forceLayout.linkDistance(function(d, i) {
                    calculateScales();
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
