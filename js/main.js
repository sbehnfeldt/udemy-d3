;(function (global, $) {
    'use strict';

    // Document ready handler
    $(function () {
        console.log('Document ready');

        const chart = d3.select('#chart-area');
        const $chart = $('#chart-area');

        // Dimensions of the entire SVG
        const WIDTH = $chart.width();   // div#chart-area already has a width: 100% of the parent
        const HEIGHT = 500;             // div#chart-area has no height, since it does not yet have any content

        // Reserve out part of the SVG for axis ticks and labels
        const MARGIN = {LEFT: 100, RIGHT: 10, TOP: 100, BOTTOM: 150};

        // Height and width of the "graphy" part of the graph
        const hGraph = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;
        const wGraph = WIDTH - MARGIN.LEFT - MARGIN.RIGHT;

        const svg = chart.append('svg')
            .attr('width', WIDTH)
            .attr('height', HEIGHT)
            .attr('border', '5px solid orange');


        d3.json('data/buildings.json').then(data => {

            // Convert height data, imported as strings, to integer
            data.forEach(d => {
                d.height = Number(d.height);
            })

            svg.append('circle')
                .attr('cx', MARGIN.LEFT)
                .attr('cy', MARGIN.TOP)
                .attr('r', 5);


            const group = svg.append('g')
                .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

            // Scale in the X-direction
            const xScale = d3.scaleBand()
                .domain(data.map(d => d.name))
                .range([0, wGraph])
                .paddingInner(0.3)
                .paddingOuter(0.2);

            // X Axis
            const xAxisCall = d3.axisBottom(xScale);
            group.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0,${hGraph})`)
                .call(xAxisCall)

                .selectAll("text")
                .attr("y", "10")
                .attr("x", "-5")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-60)");

            // Label for X Axis
            group.append("text")
                .attr("class", "x axis label")
                .attr("x", wGraph / 2)
                .attr("y", hGraph + 140)
                .attr("font-size", "20px")
                .attr("text-anchor", "middle")
                .text("Building Name");


            // Scale in the Y-direction
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.height)])
                .range([hGraph, 0]);  // "flip" the range, so Y-axis is labeled from bottom to top

            // Y Axis
            const yAxisCall = d3.axisLeft(yScale).tickSize(5).tickFormat(d => `${d}m`)
            group.append("g")
                .attr("class", "y axis")
                .call(yAxisCall);

            // Label for Y Axis
            group.append("text")
                .attr("class", "y axis-label")
                .attr("x", -hGraph / 2)
                .attr("y", -45)
                .attr("font-size", "20px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Height (m)");


            // Map building name to a color in the color scheme
            const fillMap = d3.scaleOrdinal()
                .domain(data.map(d => d.name))
                .range(d3.schemeCategory10);

            // Enter the data, draw the bars
            const bars = group
                .selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', (d,i) => xScale(d.name))
                .attr('y', (d) => yScale(d.height))
                .attr('width', xScale.bandwidth())
                .attr('height', (d) => hGraph - yScale(d.height))
                .attr('fill', (d) => fillMap(d.name))
                .attr('stroke', 'black');
        }).catch(error => {
            console.log(error);
        });
    });
})(this, jQuery);
