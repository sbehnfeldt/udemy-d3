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
        let graph;       // the "graphy" part of the graph

        // scales, axis generators. axis groups
        let xScale, xAxisCall, xAxis;
        let yScale, yAxisCall, yAxis;

        let line;   // line path generator
        let path;

        let parseTime;   // time parser for x-scale
        let bisectDate;  // for tooltip
        let MARGIN, WIDTH, HEIGHT;
        let data;


        function init(selector) {
            $widget = $(selector);
            svg = d3.select("#chart-area").append("svg");
            graph = svg.append("g");
            parseTime = d3.timeParse("%d/%m/%Y");
            bisectDate = d3.bisector(d => d.year).left;

            $('#coin-select').on('change', function() {
                update($('#coin-select').val(), $('#var-select').val());
            });

            $('#var-select').on('change', function() {
                line.y(d => yScale(d[$('#var-select').val()]));
                // yAxisCall = yAxisCall.tickFormat($('#var-select').val());
                update($('#coin-select').val(), $('#var-select').val());
            });

            xScale = d3.scaleTime();
            xAxisCall = d3.axisBottom();
            xAxis = graph.append("g").attr("class", "x axis");

            yScale = d3.scaleLinear();
            yAxisCall = d3.axisLeft().ticks(6);
            yAxis = graph.append("g").attr("class", "y axis");

            yAxis.append("text")
                .attr("class", "axis-title")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr('x', -100)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .attr("fill", "#5D6971")
                .text("Price (USD)")

            line = d3.line();
            path = graph.append("path")
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "grey")
                .attr("stroke-width", "3px")
                .attr('d', line([]));

            resize();
            return this;
        }


        function resize() {
            MARGIN = {LEFT: 75, RIGHT: 100, TOP: 50, BOTTOM: 100}
            WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
            HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM
            svg.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
                .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
            graph.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

            xScale.range([0, WIDTH]);
            xAxis.attr("transform", `translate(0, ${HEIGHT})`);

            yScale.range([HEIGHT, 0]);
            line.x(d => xScale(d.date))
                .y(d => yScale(d[$('#var-select').val()]));
        }


        function load(filename) {
            d3.json(filename).then(json => {
                // clean data
                console.log(json);
                for ( let p in json ) {
                    let currency = json[p];
                    let index = currency.length - 1;
                    while ( index >= 0 ) {
                        if ( !currency[index].market_cap) {
                            currency.splice(index, 1);
                        }
                        index--;
                    }
                    currency.forEach((d, item, array) => {
                        d.date = parseTime(d.date);
                        d['24h_vol'] = Number(d['24h_vol']);
                        d.market_cap = Number(d.market_cap)
                        d.price_usd = Number(d.price_usd)
                    });
                }
                data = json;
                update($('#coin-select').val(), $('#var-select').val());
            });

            return this;
        }


        function update(currency, val) {
            let t = d3.transition().duration(1000);

            // set scale domains
            xScale.domain(d3.extent(data[currency], d => d.date));
            xAxis.transition(t).call(xAxisCall.scale(xScale))


            yScale.domain([
                d3.min(data[currency], d => d[val]) / 1.005,
                d3.max(data[currency], d => d[val]) * 1.005
            ]);

            yAxis.transition(t).call(yAxisCall.scale(yScale))

            // add line to chart
            path.transition(t).attr('d', line(data[currency]));



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
                focus.attr("transform", `translate(${xScale(d.date)}, ${yScale(d.price_usd)})`)
                focus.select("text").text(d.price_usd)
                focus.select(".x-hover-line").attr("y2", HEIGHT - yScale(d.price_usd))
                focus.select(".y-hover-line").attr("x2", -xScale(d.date))
            }

            /******************************** Tooltip Code ********************************/
        }

        return {init, load, update};
    })();


    $(function() {
        Widget.init('#chart-area');
        Widget.load( 'data/coins.json');
    });


})(this, jQuery);
