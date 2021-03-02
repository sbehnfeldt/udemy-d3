/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

;(function (global, $) {
    'use strict';

    // Document ready handler
    $(function () {
        console.log('Document ready');

        const $chart = $('#chart-area');
        const chart = d3.select('#chart-area');

        const wChart = $chart.width();
        const hChart = 500;

        const margin = {top: 100, right: 100, bottom: 100, left: 100};
        const wGraph = wChart - margin.left - margin.right;
        const hGraph = hChart - margin.top - margin.bottom;

        // The full chart: graph plus axis plus labels
        const svg = chart
            .append('svg')
            .attr('width', wChart)
            .attr('height', hChart);

        // The "graphy" part of the graph.  Offset it from the upper-left (0, 0)
        const graph = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);


        // Label for the X-Axis
        graph.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', wGraph / 2)
            .attr('y', hGraph + 60)
            .attr('font-size', '20px')
            .attr('text-anchor', 'middle')
            .text('Month');

        const xAxisGroup = graph.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${hGraph})`)

        // Label for Y axis
        graph.append("text")
            .attr("class", "y axis-label")
            .attr("x", -hGraph / 2)
            .attr("y", -55)
            .attr('font-size', '20px')
            .attr('text-anchor', 'middle')
            .attr('transform', "rotate(-90)")
            .text('Profit over Revenue');

        const yAxisGroup = graph.append('g')
            .attr('class', 'y-axis');


        // Scale in the X-direction
        const xScale = d3.scaleBand()
            .range([0, wGraph])
            .paddingInner(0.3)
            .paddingOuter(0.2);

        // Scale in the Y-direction
        const yScale = d3.scaleLinear()
            .range([hGraph, 0]);


        d3.csv('data/revenues.csv').then(data => {

            // Convert revenue and profit (imported as strings) into numbers
            data.forEach(d => {
                d.revenue = Number(d.revenue);
                d.profit = Number(d.profit);
            });

            d3.interval(() => {
                update(data);
            }, 1000);

            update(data);

        }).catch(error => {
            console.log(error);
        });

        function update(data) {
            xScale.domain(data.map(d => d.month));
            yScale.domain([0, d3.max(data, d => d.revenue)]);

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


            // const fillMap = d3.scaleOrdinal()
            //     .domain(data.map(d => d.month))
            //     .range(d3.schemeCategory10);
            //
            // const fillMap2 = d3.scaleOrdinal()
            //     .domain(data.map(d => d.month))
            //     .range(['#53AFED', '#f4ab6b', '#1dd317', '#f76767', '#BF94E8', '#DD8675', '#EDA8D7']);

            // const bars1 = graph.selectAll('rect')
            //     .data(data);

            // bars1.enter()
            //     .append('rect')
            //     .attr('x', (d, i) => xScale(d.month))
            //     .attr('y', (d) => yScale(d.revenue))
            //     .attr('width', xScale.bandwidth())
            //     .attr('height', d => hGraph - yScale(d.revenue))
            //     .attr('fill', d => fillMap(d.month))
            //     .attr('stroke', 'black')

            // bars1.enter()
            //     .append('rect')
            //     .attr('x', (d, i) => xScale(d.month))
            //     .attr('y', (d) => yScale(d.revenue))
            //     .attr('width', xScale.bandwidth())
            //     .attr('height', d => hGraph - yScale(d.profit))
            //     .attr('fill', d => fillMap2(d.month))
            //     .attr('stroke', 'black');
        }

    });
})(this, jQuery);
