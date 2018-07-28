
//Map variables
L.mapbox.accessToken = 'pk.eyJ1IjoiZXdoIiwiYSI6ImNpZ2x4aGxiajAyMWZ2MWx6cm4wbmM3ODEifQ.dsyuEGi0oOvSxmKRvWgbLg';

let  map = L.mapbox.map('map').setView([55.1089, 12.3545], 6);
let dataset = {};

const colourArray = d3.schemeRdYlBu[10];
let interpolation = L.layerGroup().addTo(map);
let stations = L.layerGroup().addTo(map);
let theme = "";

const displayText = {
    "title": "Det Danske vejr",
    "intro": "Meteorologisk institut DMI offentliggøre hvert 10’ende år et særlig gennemarbejdet dataset der kaldes reference data <a href='http://www.dmi.dk/fileadmin/Rapporter/TR/tr13-08.pdf ' title=\"Initiates file download\" target=\"_blank\" >(http://www.dmi.dk/fileadmin/Rapporter/TR/tr13-08.pdf )</a>. Det aktuelle reference data set er basseret på årene 2001 til 2010. og kaldes reference data eller 10 års normalen. Ud over 10 års normalen findes der også et 30 års normal.\n" +
    "De data du kan arbejde med her er det aktuelle 10 års altså basseret på årene 2001 til 2010.  Du har adgang til at arbejde med nedbør eller solskinstimer.\n" +
    "Det første du skal vælge er hvilken slags data du vil arbejde med og så den måned du vil arbejde med. \n" +
    "Når du har valgt data skal du vælge parameter for interpolationen.\n",
    "dataTypePromt": "Vælg klima data type : ",
    "interHeading":"Interpolations parameter",
    "dataTypeList":[{"text":"---","value":"---"},{"text":"Temperatur","value":"temp"},{"text":"Nedbør","value":"nedboer"}],
    "periodPromt": " Vælg den periode hvis data der skal interpoleres over : ",
    "periodList":[{"text":"Års gennemsnit","value":"år"},
        {"text":"Januar","value":"jan"},{"text":"Febuar","value":"feb"},
        {"text":"Marts","value":"mar"},{"text":"April","value":"apr"},
        {"text":"Maj","value":"maj"},{"text":"Juni","value":"jun"},
        {"text":"Juli","value":"jul"},{"text":"August","value":"aug"},
        {"text":"September","value":"sep"},{"text":"Oktober","value":"okt"},
        {"text":"Januar","November":"nov"},{"text":"December","value":"dec"}],
    "fetchingMap": "Henter Kort",
    "fetching": "Henter data",
    "intTypeLable": " Vælg interpolations metode ",
    "interOpMetods":[{"text":"IDW","value":"idw"},{"text":"Voronoi","value":"voronoi"}],
    "cellSizeLable":" Størelsen på interpolations resultatets celler i km:",
    "idwPower": " Potensen af afstands funktionen i IDW",
    "interPolationBtr":"Udfør interpolation"

 };

function themeindex(i){
    if (theme =="temp"){ return 9-i}
    else {return i}
}

function Interpolation (){
    const intMethod = document.forms["InterpolationOptions"]["methodSelecter"].value;
    const intAtt = document.forms["InterpolationOptions"]["dataAttributeSelecter"].value;
    const idwPower = Number(document.forms["InterpolationOptions"]["idwPower"].value);
    const cellSize = Number(document.forms["InterpolationOptions"]["idwCellSize"].value);
    console.log(d3.select("#dataTypeSelecter").node);
    let intOptions = {};
    let grid = {};
    let extent  = [];

    function intStyle (feature) {
        let style = {fillOpacity: 0.7,weight:1,opacity:0.4};
        const range = Math.floor((feature.properties[intAtt]-extent[0])/((extent[1]-extent[0])/10));
        style.fillColor= colourArray[themeindex(range)];
        return style;
    }

    interpolation.eachLayer(function (layer) {
        console.log(layer);
        interpolation.removeLayer(layer);
    });

    if (intMethod == "voronoi") {
        let bounds = map.getBounds();
        intOptions.bbox = [bounds._southWest.lng,bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat];
        grid = turf.voronoi(dataset, intOptions);
        dataset.features.forEach(function(d,i){
             grid.features[i].properties[intAtt] = d.properties[intAtt];
        })
    } else if (intMethod == "idw"){
        intOptions = {"weight": idwPower,"gridType": 'hex', "units": 'kilometers'};
        intOptions.property = intAtt;
        grid = turf.interpolate(dataset, cellSize, intOptions);
     }
    extent = d3.extent(grid.features, d => d.properties[intAtt]);
    console.log(extent)
    L.geoJSON(grid,{style: intStyle}).addTo(interpolation);
    const f = d3.format(".2f");
    const intpLegend = d3.select("#info")
    intpLegend.node().innerHTML="";
    var legendSpan = intpLegend.selectAll("span")
        .data(colourArray)
        .enter().append("span")
        .text(function(d,i){
            return " [" + f(extent[0]+ (((extent[1]-extent[0])/10) * i)) + " , " + f(extent[0]+ (((extent[1]-extent[0])/10) * (i +1))) + "[ "
        })
        .attr("style",function (d,i) {
            return "background-color:" + colourArray[themeindex(i)]
        })







}

async function showData(name) {
     var geojsonMarkerOptions = {
        radius: 3,
        fillColor: "#7587ff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    theme = name;
    stations.eachLayer(function (layer) {
         map.removeLayer(layer);
    });

     d3.select("#status").text(displayText.fetching);
    if (map.hasLayer("overlay")){map.removeLayer("overlay")}
    try {
        dataset = await d3.json("data/"+name +".geojson");
        d3.select("#status").node().innerHTML=""; //Clear wait status
        //displayAggTypes();
        console.log(dataset)
        //    Create Base map
        L.geoJSON(dataset, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }}).addTo(stations,"overlay");
      } catch(e) {
        console.log(e); //
    }
}



function addOptions(){
    //Data type selecter
    let selectorArea = d3.select("#dataSetSelect");
    selectorArea.append('lable').text( displayText.dataTypePromt);
    selectorArea.append("select")
        .attr("id","dataTypeSelecter")
        .attr("onchange","showData(this.options[this.selectedIndex].value)")
        .selectAll("option")
        .data(displayText.dataTypeList)
        .enter().append("option")
        .text((d)=>d.text)
        .attr("value",(d)=>d.value)

    //Mounth selecter
    selectorArea = d3.select("#monthSelect");

    let interOpForm = selectorArea.append("form").attr("name","InterpolationOptions").attr("onSubmit"," Interpolation(); return false");
    interOpForm.append('lable').text( displayText.periodPromt);
    interOpForm.append("select")
        .attr("id","dataAttributeSelecter")
        .selectAll("option")
        .data(displayText.periodList)
        .enter().append("option")
        .text((d)=>d.text)
        .attr("value",(d)=>d.value)
    interOpForm.append('lable').text( displayText.intTypeLable);
    interOpForm.append("select")
        .attr("id","methodSelecter")
        .selectAll("option")
        .data(displayText.interOpMetods)
        .enter().append("option")
        .text((d)=>d.text)
        .attr("value",(d)=>d.value)

    interOpForm.append("lable").text(displayText.idwPower);
    interOpForm.append("input").attr("name","idwPower").attr("type","number")
        .attr("min","0.5").attr("max","4").attr("step","0.5").attr("value","1");
    interOpForm.append("lable").text(displayText.cellSizeLable);
    interOpForm.append("input").attr("name","idwCellSize").attr("type","number")
        .attr("min","1").attr("max","10").attr("step","1").attr("value","5");
     interOpForm.append("button").attr('type', 'submit').text(displayText.interPolationBtr)

}


function addBaseMap(){
     L.esri.basemapLayer('NationalGeographic').addTo(map);
}

d3.select("#pageTitle").node().innerHTML=displayText.title;
d3.select("#title").node().innerHTML=displayText.title;
d3.select("#intro").node().innerHTML=displayText.intro;
d3.select("#interpolation").node().innerHTML=displayText.interHeading;

addOptions();
addBaseMap();



//fetchData();
