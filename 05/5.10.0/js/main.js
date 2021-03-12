/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

;(function (global, $) {
    'use strict';

    let Chart = (function () {
        let chart;
        let $chart;

        const MARGIN = {top: 100, right: 100, bottom:100, left: 100};
        const updateInterval = 500;

        let svg;
        let graph;
        let xLabel;
        let xAxisGroup;
        let xScale;
        let yLabel;
        let yAxisGroup;
        let yScale;
        let yearLabel;
        let tip;

        let fillColors = {
            'europe' : 'saddlebrown',
            'asia' : 'red',
            'americas' : 'yellow',
            'africa' : 'blue'
        };

        function init(selector) {
            let tempX, tempY;
            $chart = $(selector);
            chart = d3.select(selector);

            svg = chart.append('svg')
                .attr('width', $chart.width())
                .attr('height', $chart.height());

            graph = svg.append('g')
                .attr('class', 'graph')
                .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);


            tip = d3.tip()
                .attr('class', 'd3-tip')
                .html(d=>{
                    let text = `<strong>Country: </strong><span style="color: red">${d.country}</span><br>`
                    text += `<strong>Continent: </strong><span style="color: red; text-transform: capitalize">${d.continent}</span><br>`
                    text += `<strong>Life Expectancy: </strong><span style="color: red">${d3.format('.2f')(d.life_exp)}</span><br>`
                    text += `<strong>GDP Per Capita: </strong><span style="color: red">${d3.format('$,.0f')(d.income)}</span><br>`
                    text += `<strong>Population: </strong><span style="color: red">${d3.format(',.0f')(d.population)}</span><br>`
                    return text;
                });
            graph.call(tip);


            xLabel = svg.append('text')
                .attr('class', 'x-axis-label')
                .attr('x', MARGIN.left + ($chart.width() - MARGIN.left - MARGIN.right) / 2)
                .attr('y', $chart.height() - MARGIN.bottom / 2  )
                .attr('font-size', '20px')
                .text('GDP Per Capita ($)');

            tempX = MARGIN.left;
            tempY = $chart.height() - MARGIN.bottom;
            xAxisGroup = svg.append('g')
                .attr('class', 'x-axis-group')
                .attr('transform', `translate(${tempX}, ${tempY})`);

            xScale = d3.scaleLog()
                .domain([40, 40000])
                .range([1, $chart.width() - MARGIN.left - MARGIN.bottom]);

            const xAxisCall = d3.axisBottom(xScale)
                .ticks(3)
                .tickFormat(d => d)
            xAxisGroup.call(xAxisCall);


            yLabel = svg.append('text')
                .attr('class', 'y-axis-label')
                .attr('transform', 'rotate(-90)')
                .attr('x', -$chart.height() / 2 - MARGIN.top)
                .attr('y', MARGIN.left / 2)
                .text('Life Expectancy (Years)');

            tempX = MARGIN.left;
            tempY = MARGIN.top;
            yAxisGroup = svg.append('g')
                .attr('class', 'y-axis-group')
                .attr('transform', `translate(${tempX}, ${tempY})`);

            yScale = d3.scaleLinear()
                .range([0, $chart.height() - MARGIN.top - MARGIN.bottom])
                .domain([100, 0]);
            const yAxisCall = d3.axisLeft(yScale);

            yAxisGroup.call(yAxisCall);

            yearLabel = svg.append( 'text')
                .attr( 'class', 'year-label' )
                .attr( 'x', $chart.width() / 2 )
                .attr( 'y', $chart.height() - MARGIN.top - MARGIN.bottom)
                .attr( 'fill', 'green' )
                .text( '1800');


            const legend = svg.append( 'g')
                .attr('class', 'legend')
                .attr('transform', `translate(${$chart.width() - MARGIN.right}, ${$chart.height() - MARGIN.top - MARGIN.bottom})`)

            let i = 0;
            for ( let p in fillColors) {
                const legendRow = legend.append('g')
                    .attr('transform', `translate(0, ${i * 20})`);

                legendRow.append('rect')
                    .attr('width', 10)
                    .attr('height', 10)
                    .attr('fill', fillColors[p]);
                legendRow.append('text')
                    .text(p)
                    .style('text-transform', 'capitalize')
                    .attr('x', -10)
                    .attr('y', 10)
                    .attr('text-anchor', 'end')
                i++;
            }

            return this;
        }


        function load(filename) {
            d3.json(filename).then(function (data) {
                console.log(data);
                update(data[0])

                let i = 1;
                let interval = d3.interval(() => {
                    update(data[i]);
                    i++;
                    if ( i >= data.length ) {
                        // interval.stop();
                        i = 0;
                    }
                }, updateInterval);
            });
        }


        function update(data) {
            let t = d3.transition().duration(.55 * updateInterval);

            const dots = graph.selectAll('circle')
                .data(data.countries, d => d.country);
            yearLabel.text( data.year );

            dots.exit().remove();

            dots.enter()
                .append('circle')
                .on('mouseout', tip.hide)
                .on('mouseover', tip.show)
                .transition(t)
                .attr('cx', d => d.income ?  xScale(d.income) : 0 )
                .attr('cy', d => d.life_exp ? yScale(d.life_exp) : yScale(0) )
                .attr('r', d => Math.sqrt(d.population / 3.14)/100)
                .attr('fill', d => fillColors[d.continent]);


            dots.transition(t)
                .attr('cx', d => d.income ? xScale(d.income) : 0 )
                .attr('cy', d => d.life_exp ? yScale(d.life_exp) : yScale(0) )
                .attr('r', d => Math.sqrt(d.population / 3.14)/250)
                .attr('fill', d => fillColors[d.continent]);
        }

        return {init, load};
    })();


    $(function () {
        console.log('Document ready');
        Chart.init('#chart-area').load("data/data.json")
    });

})(this, jQuery);
