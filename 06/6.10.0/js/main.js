/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/

;(function (global, $) {
    'use strict';

    let Widget = (function () {
        let $widget;
        let svg;
        let graph;
        let parseTime;   // time parser for x-scale
        let bisectDate;  // for tooltip

        // scales, axis generators. axis groups
        let xScale, xAxisCall, xAxis;
        let yScale, yAxisCall, yAxis;

        let line;   // line path generator
        let MARGIN, WIDTH, HEIGHT;

        function init(selector) {
            $widget = $(selector);
            svg = d3.select("#chart-area").append("svg");
            graph = svg.append("g");
            parseTime = d3.timeParse("%Y");
            bisectDate = d3.bisector(d => d.year).left;

            xScale = d3.scaleTime();
            xAxisCall = d3.axisBottom();
            xAxis = graph.append("g").attr("class", "x axis");

            yScale = d3.scaleLinear();
            yAxisCall = d3.axisLeft().ticks(6).tickFormat(d => `${parseInt(d / 1000)}k`);
            yAxis = graph.append("g").attr("class", "y axis");

            yAxis.append("text")
                .attr("class", "axis-title")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .attr("fill", "#5D6971")
                .text("Population")

            line = d3.line();
            resize();
            return this;
        }


        function resize() {
            MARGIN = {LEFT: 20, RIGHT: 100, TOP: 50, BOTTOM: 100}
            WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
            HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM
            svg.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
                .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
            graph.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

            xScale.range([0, WIDTH]);
            xAxis.attr("transform", `translate(0, ${HEIGHT})`);

            yScale.range([HEIGHT, 0]);
            line.x(d => xScale(d.year))
                .y(d => yScale(d.value));
            return this;
        }


        function load(filename) {
            d3.json(filename).then(data => {
                // clean data
                data.forEach(d => {
                    d.year = parseTime(d.year)
                    d.value = Number(d.value)
                })

                // set scale domains
                xScale.domain(d3.extent(data, d => d.year))
                yScale.domain([
                    d3.min(data, d => d.value) / 1.005,
                    d3.max(data, d => d.value) * 1.005
                ])

                // generate axes once scales have been set
                xAxis.call(xAxisCall.scale(xScale))
                yAxis.call(yAxisCall.scale(yScale))

                // add line to chart
                graph.append("path")
                    .attr("class", "line")
                    .attr("fill", "none")
                    .attr("stroke", "grey")
                    .attr("stroke-width", "3px")
                    .attr("d", line(data))

                /******************************** Tooltip Code ********************************/

                const focus = graph.append("g")
                    .attr("class", "focus")
                    .style("display", "none")

                focus.append("line")
                    .attr("class", "x-hover-line hover-line")
                    .attr("y1", 0)
                    .attr("y2", HEIGHT)

                focus.append("line")
                    .attr("class", "y-hover-line hover-line")
                    .attr("x1", 0)
                    .attr("x2", WIDTH)

                focus.append("circle")
                    .attr("r", 7.5)

                focus.append("text")
                    .attr("x", 15)
                    .attr("dy", ".31em")

                graph.append("rect")
                    .attr("class", "overlay")
                    .attr("width", WIDTH)
                    .attr("height", HEIGHT)
                    .on("mouseover", () => focus.style("display", null))
                    .on("mouseout", () => focus.style("display", "none"))
                    .on("mousemove", mousemove)

                function mousemove() {
                    const x0 = xScale.invert(d3.mouse(this)[0])
                    const i = bisectDate(data, x0, 1)
                    const d0 = data[i - 1]
                    const d1 = data[i]
                    const d = x0 - d0.year > d1.year - x0 ? d1 : d0
                    focus.attr("transform", `translate(${xScale(d.year)}, ${yScale(d.value)})`)
                    focus.select("text").text(d.value)
                    focus.select(".x-hover-line").attr("y2", HEIGHT - yScale(d.value))
                    focus.select(".y-hover-line").attr("x2", -xScale(d.year))
                }

                /******************************** Tooltip Code ********************************/
            });

            return this;
        }


        function update() {
        }

        return {init, load, update};
    })();


    $(function() {
        Widget.init('#chart-area');
        Widget.load( 'data/example.json');
    });


})(this, jQuery);
