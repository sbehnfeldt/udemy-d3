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

        let $coinSelect;  // Drop down list to select which currency to graph
        let $varSelect;   // Drop down list to select which variable of the currency to graph
        let $slider;      // Date range slider


        function init(selector) {
            $widget = $(selector);
            svg = d3.select("#chart-area").append("svg");
            graph = svg.append("g");
            parseTime = d3.timeParse("%d/%m/%Y");
            bisectDate = d3.bisector(d => d.date).left;

            $coinSelect =$('#coin-select');
            $coinSelect.on('change', function() {
                $slider.slider("option", "max", data[$coinSelect.val()].length);
                $slider.slider("option", "values", [ 0, data[$coinSelect.val()].length - 1]);
                update($coinSelect.val(), $varSelect.val(), $slider.slider("option", "values"));
            });

            $varSelect = $('#var-select');
            $varSelect.on('change', function() {
                line.y(d => yScale(d[$varSelect.val()]));
                // yAxisCall = yAxisCall.tickFormat($('#var-select').val());
                update($coinSelect.val(), $varSelect.val(), $slider.slider("option", "values"));
            });

            // Initialize the slider with some sensible values, and attach a listener onto the slide event to trigger your update() function.
            $slider = $('#date-slider');
            $slider.slider({
                step:1,
                range: true,
                slide: (event, ui) => {
                    update($coinSelect.val(), $varSelect.val(), $slider.slider("option", "values"));
                }
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
            d3.json(filename)
                .then(json => {
                    console.log(json);

                    // Clean data
                    // For each currency, find the datum at which "real values" begin;
                    // trim off all the data before that
                    for (let p in json) {
                        let currency = json[p];
                        let i = 0;
                        while (i < currency.length) {
                            if (currency[i].market_cap) {
                                currency.splice(0, i);
                                break;
                            }
                            i++;
                        }

                        // Parse each string in the resultant data set into dates and integers accordingly
                        currency.forEach((d, item, array) => {
                            d.date = parseTime(d.date);
                            d['24h_vol'] = Number(d['24h_vol']);
                            d.market_cap = Number(d.market_cap)
                            d.price_usd = Number(d.price_usd)
                        });
                    }
                    data = json;

                    // Set the max value of the slider to the extent of the cleansed data
                    let max = data[$coinSelect.val()].length - 1;
                    $slider.slider("option", "max", max);
                    $slider.slider("option", "values", [ 0, max ]);

                    update($coinSelect.val(), $varSelect.val(), $slider.slider("option", "values"));
                });

            return this;
        }


        function update(currency, val, range) {
            let start, stop;
            let t = d3.transition().duration(1000);

            if ( undefined === range ) {
                start = 0;
                stop = data[currency].length - 1;
            } else {
                start = range[0];
                stop = range[1];
            }
            let subset = data[currency].slice(start, stop);


            // set scale domains
            xScale.domain(d3.extent(subset, d => d.date));
            xAxis.transition(t).call(xAxisCall.scale(xScale))

            yScale.domain([
                d3.min(data[currency], d => d[val]) / 1.005,
                d3.max(data[currency], d => d[val]) * 1.005
            ]);
            yAxis.transition(t).call(yAxisCall.scale(yScale))


            // add line to chart
            path.transition(t).attr('d', line(subset));

            // Update Date Range text according to the date range slider control
            let c = $coinSelect.val();
            let d = data[c];
            let d1 = d[range[0]].date;
            let d2 = d[range[1]].date;
            $('#dateLabel1').text(`${d1.getMonth()}/${d1.getDate()}/${d1.getFullYear()}`);
            $('#dateLabel2').text(`${d2.getMonth()}/${d2.getDate()}/${d2.getFullYear()}`);

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
                const x0 = xScale.invert(d3.mouse(this)[0]);   // Get x value
                const i = bisectDate(subset, x0, 1);
                const d0 = subset[i - 1];
                const d1 = subset[i];
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
