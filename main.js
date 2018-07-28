
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */

/*global d3, dc, crossfilter*/
/* eslint-env  jquery */
/* eslint no-console: off */

dc.config.defaultColors('Categorical');
var chart = dc.barChart("#test");

function generatePopulation(){
    const dataMean=document.getElementById('meanInput').value;
    const dataStdDivr=Math.sqrt(document.getElementById('varInput').value);


    var data = d3.range(200000).map(function() {
        return Math.round(d3.randomNormal(dataMean, dataStdDivr)());
    });

    var ndx = crossfilter(data);
    var typeDimension = ndx.dimension(function (d) {return d; });
    var typeGroup = typeDimension.group().reduceCount();
    console.log(typeGroup.top(1)[0].value);
    chart
         .width(768)
            .height(480)
            .centerBar(true)
            .x(d3.scaleLinear().domain([0, 40]))
            .elasticX(true)
            .y(d3.scaleLinear().domain([0, typeGroup.top(1)[0].value]))
            .elasticY(true)
            .yAxisLabel("Antal observationer")
            .brushOn(false)
            .dimension(typeDimension)
            .group(typeGroup);
    chart.render();
    document.getElementById('varCalc').value= d3.variance(data);
    document.getElementById('meanCalc').value= d3.mean(data)
}






