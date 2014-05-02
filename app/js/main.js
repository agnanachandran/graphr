//d3.select('body')
    //.append('p')
    //.text('New paragraph!');

//var dataSet = [ 25, 7, 5, 26, 11, 8, 25, 14, 23, 19,
                //14, 11, 22, 29, 11, 13, 12, 17, 18, 10,
                //24, 18, 25, 9, 3 ];
//d3.select('body')
    //.selectAll('p')
    //.data(dataSet)
    //.enter()
    //.append('p')
    //.text(function(d) { return "I can count up to " + d; })
    //.style("color", function(d) {
        //if (d % 2 == 0) {
            //return "red";
        //} else {
            //return "black";
        //}
    //});

//d3.select('body').selectAll('div#bar')
    //.data(dataSet)
    //.enter()
    //.append('div')
    //.attr('class', 'bar')
    //.style('height', function(d) {
        //return d * 5 + 'px';
    //});

var WIDTH = 600;
var HEIGHT = 250;
var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
// Define the gradient
var svg = d3.select('body').append('svg');

svg.attr('width', WIDTH);
svg.attr('height', HEIGHT);

var xScale = d3.scale.ordinal()
                .domain(d3.range(dataset.length))
                .rangeRoundBands([0, WIDTH], 0.05);

var yScale = d3.scale.linear()
                .domain([0, d3.max(dataset)])
                .range([0, HEIGHT]);

// Define gradient
//var gradient = svg.append("svg:defs")
    //.append("svg:linearGradient")
    //.attr("id", "gradient")
    //.attr("x1", "0%")
    //.attr("y1", "0%")
    //.attr("x2", "100%")
    //.attr("y2", "100%")
    //.attr("spreadMethod", "pad");

//// Define the gradient colors
//gradient.append("svg:stop")
    //.attr("offset", "0%")
    //.attr("stop-color", "#eeeeee")
    //.attr("stop-opacity", 1);

//gradient.append("svg:stop")
    //.attr("offset", "100%")
    //.attr("stop-color", "#ffffff")
    //.attr("stop-opacity", 1);

//var circles = svg.selectAll('circle')
    //.data(dataset)
    //.enter()
    //.append('circle');

//circles
    //.attr('cx', function(d, i) {
        //return i*50 + 25;
    //})
    //.attr('cy', HEIGHT/2)
    //.attr('r', function(d) {
        //return d;
    //});
    //.attr('fill', 'url(#gradient)');

var barPadding = 1;

//Create bars
svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return xScale(i);
    })
    .attr("y", function(d) {
        return HEIGHT - yScale(d);
    })
    .attr("width", xScale.rangeBand())
    .attr("height", function(d) {
        return yScale(d);
    })
    .attr("fill", function(d) {
        return "rgb(0, 0, " + (d * 10) + ")";
    });

//Create labels
svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) {
        return d;
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d, i) {
        return xScale(i) + xScale.rangeBand() / 2;
    })
    .attr("y", function(d) {
        return HEIGHT - yScale(d) + 14;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "white");

d3.select('p')
    .on('click', function() {
        //New values for dataset
        var numValues = dataset.length;
        dataset = [];
        var maxValue = 100;
        for (var i = 0; i < numValues; i++) {
            var newNumber = Math.floor(Math.random() * maxValue);
            dataset.push(newNumber);
        }

        yScale.domain([0, d3.max(dataset)]);
        //Update all rects
        svg.selectAll("rect")
            .data(dataset)
            .transition()
            .delay(function(d, i) {
                return i / dataset.length * 1000;
            })
            .duration(500)
            .attr("y", function(d) {
                return HEIGHT - yScale(d);
            })
            .attr("height", function(d) {
                return yScale(d);
            })
            .attr("fill", function(d) {
                return "rgb(0, 0, " + (d * 10) + ")";
            });

        //Update all labels
        svg.selectAll("text")
            .data(dataset)
            .transition()
            .delay(function(d, i) {
                return i / dataset.length * 1000;
            })
            .duration(500)
            .text(function(d) {
                return d;
            })
            .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
            })
            .attr("y", function(d) {
                return HEIGHT - yScale(d) + 14;
            });
    });

//var dataset = [];
//var numDataPoints = 50;
//var xRange = Math.random() * 1000;
//var yRange = Math.random() * 1000;
//for (var i = 0; i < numDataPoints; i++) {
    //var newNumber1 = Math.floor(Math.random() * xRange);
    //var newNumber2 = Math.floor(Math.random() * yRange);
    //dataset.push([newNumber1, newNumber2]);
//}

//var padding = 30;

//var xScale = d3.scale.linear()
                     //.domain([0, d3.max(dataset, function(d) { return d[0]; })])
                     //.range([padding, WIDTH - padding*2]);

//var yScale = d3.scale.linear()
                     //.domain([0, d3.max(dataset, function(d) { return d[1]; })])
                     //.range([HEIGHT - padding, padding]);

//var rScale = d3.scale.linear()
                     //.domain([0, d3.max(dataset, function(d) { return d[1]; })])
                     //.range([2, 5]);

//var xAxis = d3.svg.axis();
//xAxis.scale(xScale);
//xAxis.orient('bottom');
//xAxis.ticks(5);

//var yAxis = d3.svg.axis()
                  //.scale(yScale)
                  //.orient("left")
                  //.ticks(5);

//svg.selectAll('circle')
    //.data(dataset)
    //.enter()
    //.append('circle')
    //.attr('cx', function(d) {
        //return xScale(d[0]);
    //})
    //.attr('cy', function(d) {
        //return yScale(d[1]);
    //})
    //.attr('r', function(d) {
        //return rScale(d[1]);
    //});


//svg.selectAll("text")  // <-- Note "text", not "circle" or "rect"
   //.data(dataset)
   //.enter()
   //.append("text")
   //.text(function(d) {
       //return d[0] + "," + d[1];
   //})
   //.attr("x", function(d) {
        //return xScale(d[0]);
   //})
   //.attr("y", function(d) {
        //return yScale(d[1]);
   //})
   //.attr("font-family", "sans-serif")
   //.attr("font-size", "11px")
   //.attr("fill", "red");

//svg.append('g')
    //.attr('class', 'axis')
    //.attr("transform", "translate(0," + (HEIGHT - padding) + ")")
    //.call(xAxis);

//svg.append('g')
    //.attr('class', 'axis')
    //.attr('transform', 'translate(' + padding+",0)")
    //.call(yAxis);

//var defs = svg.append("defs");

//var filter = defs.append("filter")
    //.attr("id", "drop-shadow")
    //.attr("height", "130%");

//filter.append("feGaussianBlur")
    //.attr("in", "SourceAlpha")
    //.attr("stdDeviation", 5)
    //.attr("result", "blur");

//filter.append("feOffset")
    //.attr("in", "blur")
    //.attr("dx", 5)
    //.attr("dy", 5)
    //.attr("result", "offsetBlur");

//var feMerge = filter.append("feMerge");

//feMerge.append("feMergeNode")
    //.attr("in", "offsetBlur")
//feMerge.append("feMergeNode")
    //.attr("in", "SourceGraphic");

//var colors = [];
//for (var i = 0; i < 5; i++) {
    //colors.push(Math.floor(Math.random() * 20));
//}

//var circles = svg.selectAll('circle')
    //.data([1, 3, 7])
    //.enter()
    //.append('circle');

//circles
    //.attr('cx', function(d, i) {
        //return i*50 + 25;
    //})
    //.attr('cy', 25)
    //.attr('r', function(d) {
        //return d;
    //})
    //.attr('fill', 'white')
    //.attr('stroke', function(d, i) {
        //return 'rgb('+ colors[i + 1] + ', 20, ' + colors[i] + ')';
    //})
    //.attr('stroke-width', 1);

//svg.selectAll('circle')
    //.data([3, 5, 9])
    //.transition()
    //.duration(2000)
    //.ease("elastic")
    //.style("filter", "url(#drop-shadow)")
    //.attr('stroke-width', 2)
    //.attr("transform", function(d) { return "translate(" + d * 30 + "," + d * 30 + ")"; })
    //.attr('r', function(d) {
        //return d*5;
    //});
