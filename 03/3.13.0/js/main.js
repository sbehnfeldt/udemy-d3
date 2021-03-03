/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

;(function (global, $) {
    'use strict';

    let Widget = (function (){

        let $chart;
        let chart;

        let svg;       // The full chart: graph plus axis plus labels
        let graph;     // The "graphy" part of the chart

        let xLabel;    // Label for the X-Axis
        let xAxisGroup;
        let xScale;    // Scale in the X-direction

        let yLabel;    // Label for Y axis
        let yAxisGroup;
        let yScale;    // Scale in the Y-direction

        let wChart;
        let hChart;
        let margin;
        let wGraph;
        let hGraph;
        let fillMap;
        let fillMap2;

        let flag;

        function init(selector) {
            $chart = $(selector);
            chart = d3.select(selector);

            wChart = $chart.width();
            hChart = 500;
            margin = {top: 100, right: 100, bottom: 100, left: 100};
            wGraph = wChart - margin.left - margin.right;
            hGraph = hChart - margin.top - margin.bottom;

            svg = chart
                .append('svg')
                .attr('width', wChart)
                .attr('height', hChart);

            // Offset it from the upper-left (0, 0)
            graph = svg.append('g')
                .attr( 'class', 'graph')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            xLabel = graph.append('text')
                .attr('class', 'x-axis-label')
                .attr('x', wGraph / 2)
                .attr('y', hGraph + 60)
                .attr('font-size', '20px')
                .attr('text-anchor', 'middle')
                .text('Month');

             xAxisGroup = graph.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0, ${hGraph})`)

            yLabel = graph.append("text")
                .attr("class", "y axis-label")
                .attr("x", -hGraph / 2)
                .attr("y", -55)
                .attr('font-size', '20px')
                .attr('text-anchor', 'middle')
                .attr('transform', "rotate(-90)")
                .text('Profit over Revenue');

            yAxisGroup = graph.append('g')
                .attr('class', 'y-axis');

            xScale = d3.scaleBand()
                .range([0, wGraph])
                .paddingInner(0.3)
                .paddingOuter(0.2);

            yScale = d3.scaleLinear()
                .range([hGraph, 0]);

            fillMap = d3.scaleOrdinal().range(d3.schemeCategory10);
            fillMap2 = d3.scaleOrdinal().range(['#53AFED', '#f4ab6b', '#1dd317', '#f76767', '#BF94E8', '#DD8675', '#EDA8D7']);
        }


        function load(filename) {
            d3.csv(filename).then(data => {

                // Convert revenue and profit (imported as strings) into numbers
                data.forEach(d => {
                    d.revenue = Number(d.revenue);
                    d.profit = Number(d.profit);
                });

                flag = true;
                d3.interval(() => {
                    flag = !flag;
                    update(data);
                }, 1000);

                update(data);

            }).catch(error => {
                console.log(error);
            });
        }

        function update(data) {
            const value = flag ? "profit" : "revenue";

            xScale.domain(data.map(d => d.month));
            yScale.domain([0, d3.max(data, d => d.revenue > d.profit ? d.revenue : d.profit )]);
            fillMap.domain(data.map(d => d.month));
            fillMap2.domain(data.map(d => d.month));

            // X Axis
            const xAxisCall = d3.axisBottom(xScale);
            xAxisGroup.call(xAxisCall)
                .selectAll('text')
                .attr('y', 10)
                .attr('x', -5)
                .attr('text-anchor', 'end')
                .attr('transform', 'rotate(-60)');

            // Y Axis
            const yAxisCall = d3.axisLeft(yScale)
                .tickSize(4)
                .tickFormat(d => `$${d}`);
            yAxisGroup.call(yAxisCall);


            // JOIN new data with old elements
            const bars1 = graph.selectAll('rect')
                .data(data);

            // EXIT (remove) old elements not present in new data
            bars1.exit().remove();

            // UPDATE old elements present in new data.
            // (For this project, this is nearly identical to the styling of the new elements.)
            bars1
                .attr('x', d => xScale(d.month))
                .attr('y', d => yScale(d[value]))
                .attr('width', xScale.bandwidth())
                .attr('height', d => hGraph - yScale(d[value]))
                .attr('fill', d => flag ? fillMap(d.month) : fillMap2(d.month))

            // ENTER new elements present in new data
            bars1.enter()
                .append('rect')
                .attr('x', d => xScale(d.month))
                .attr('y', d => yScale(d[value]))
                .attr('width', xScale.bandwidth())
                .attr('height', d => hGraph - yScale(d[value]))
                .attr('fill', d => fillMap(d.month))
                .attr('stroke', 'black');

            const text = flag ? "Profit ($)" : "Revenue ($)";
            yLabel.text(text);
        }

        return { init, load };

    })();

    // Document ready handler
    $(function () {
        console.log('Document ready');
        Widget.init('#chart-area');
        Widget.load('data/revenues.csv');
    });
})(this, jQuery);
