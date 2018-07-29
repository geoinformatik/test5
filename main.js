
/*global d3, dc, crossfilter*/
/* eslint-env  jquery */
/* eslint no-console: off */

dc.config.defaultColors('Categorical');
var chart = dc.barChart("#test");
var data;

function generatePopulation() {
    const dataMean = document.getElementById('meanInput').value;
    const dataStdDivr = Math.sqrt(document.getElementById('varInput').value);


    data = d3.range(200000).map(function() {
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

function getRandom(length) { return Math.floor(Math.random()*(length)); }

function getRandomSample(array, size) {
    var length = array.length;

    for(var i = size; i--;) {
        var index = getRandom(length);
        var temp = array[index];
        array[index] = array[i];
        array[i] = temp;
    }

    return array.slice(0, size);
}

function samplePopulation(){
    let goodSampels = 0;
    let badSampels = 0;
    const sampleSize=document.getElementById('sampleSize').value;
    const numberOfSampels=document.getElementById('numberOfSampels').value;
    const popMean = document.getElementById('meanCalc').value;
    const marginOfError = document.getElementById('marginOfError').value
    var sampleArray = d3.range(numberOfSampels).map(function() {
        return d3.mean(getRandomSample(data, sampleSize));});
    console.log(sampleArray);
    var arrayLength = sampleArray.length;
    for (var i = 0; i < arrayLength; i++) {
        if (Math.abs(sampleArray[i] - popMean) > marginOfError) {
            badSampels++
        }else{
            goodSampels++
        }
    }
    document.getElementById('goodSampels').value= goodSampels;
    document.getElementById('badSampels').value= badSampels;

}

