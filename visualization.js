queue()
  .defer(d3.json, "coast.json")
  .defer(d3.json, "us.json")
  .defer(d3.csv,  "census.csv")
  .await(ready);

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    sliderHeight = 20,
    sliderWidth = 600,
    maxZoom = 6,
    active = d3.select(null),
    brewer = ["", "q0-9", "q1-9", "q2-9", "q3-9", "q4-9",
              "q5-9", "q6-9", "q7-9", "q8-9"],
    data = {},
    densityFormat = d3.format(",.2f"),
    percentageFormat = d3.format(".2%");

// Map of maps
var maps = {
  "slavePopulation": {
    "field": "slavePopulation",
    "label": "Enslaved population",
    "color": "YlOrRd",
    "scale": d3.scale.threshold()
            .domain([1,10,33,100,333,1e3,3.33e3,10e3,33.3e3,100e3])
            .range(brewer)
  },
  "slaveDensity": {
    "field": "slaveDensity",
    "label": "Enslaved persons/mile²",
    "color": "YlOrRd",
    "scale": d3.scale.threshold()
            .domain([0.01,0.5,1,5,10,20,30,40,50,200])
            .range(brewer)
  },
  "slavePercentage": {
    "field": "slavePercentage",
    "label": "Enslaved population (%)",
    "color": "YlOrRd",
    "scale": d3.scale.threshold()
            .domain([0.01,1,10,20,30,40,50,60,70,100])
            .range(brewer)
  },
  "freeAfAmPopulation": {
    "field": "freeAfAmPopulation",
    "label": "Free African Americans",
    "color": "YlGn",
    "scale": d3.scale.threshold()
            .domain([1,10,33,100,333,1e3,3.33e3,10e3,33.3e3,100e3])
            .range(brewer)
  },
  "freeAfAmDensity": {
    "field": "freeAfAmDensity",
    "label": "Free African Americans/mile²",
    "color": "YlGn",
    "scale": d3.scale.threshold()
            .domain([0.01,0.5,1,5,10,20,30,40,50,200])
            .range(brewer)
  },
  "freeAfAmPercentage": {
    "field": "freeAfAmPercentage",
    "label": "Free African Americans (%)",
    "color": "YlGn",
    "scale": d3.scale.threshold()
            .domain([0.1,1,2.5,5,7.5,10,20,30,40,100])
            .range(brewer)
  },
  "freeTotalPopulation": {
    "field": "freeTotalPopulation",
    "label": "Total free population",
    "color": "BuPu",
    "scale": d3.scale.threshold()
            .domain([10,33,100,333,1e3,3.33e3,10e3,33.3e3,100e3,1e6])
            .range(brewer)
  },
  "freeTotalDensity": {
    "field": "freeTotalDensity",
    "label": "All free persons/mile²",
    "color": "BuPu",
    "scale": d3.scale.threshold()
            .domain([0.01,1,5,10,25,50,100,500,1e3,50e3])
            .range(brewer)
  },
  "freeTotalPercentage": {
    "field": "freeTotalPercentage",
    "label": "All free persons (%)",
    "color": "BuPu",
    "scale": d3.scale.threshold()
            .domain([0.1,20,30,40,50,60,70,80,90,100.001])
            .range(brewer)
  },
  "totalPopulation": {
    "field": "totalPopulation",
    "label": "Total population",
    "color": "YlGnBu",
    "scale": d3.scale.threshold()
            .domain([10,33,100,333,1e3,3.33e3,10e3,33.3e3,100e3,1e6])
            .range(brewer)
  },
  "totalDensity": {
    "field": "totalDensity",
    "label": "All persons/mile²",
    "color": "YlGnBu",
    "scale": d3.scale.threshold()
             .domain([0.01,1,5,10,25,50,100,500,1e3,50e3])
             .range(brewer)
  }
};

var current = { "year": 1790, "map" : maps.slavePopulation };

var svg = d3.select("#viz").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .classed("YlOrRd", true)
      .on("click", stopped, true);

var loading = svg.append("text")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .text("Loading the map ...");

// Year slider
var sliderContainer = d3.select("#slider").append("svg")
      .attr("width", sliderWidth + margin.left + margin.right)
      .attr("height", sliderHeight + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.linear()
      .domain([1785, 1864])
      .range([0, sliderWidth])
      .clamp(true);

var brushToYear = d3.scale.threshold()
      .domain([1790,1800,1810,1820,1830,1840,1850,1860])
      .range([1790,1800,1810,1820,1830,1840,1850,1860]);

var brush = d3.svg.brush()
  .x(x)
  .extent([current.year, current.year])
  .on("brush", brushed);

sliderContainer.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + sliderHeight / 2 + ")")
  .call(d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(8)
          .tickFormat(function(d) { return d; })
          .tickSize(0)
          .tickPadding(12))
          .select(".domain")
          .select(function() { 
            return this.parentNode.appendChild(this.cloneNode(true)); 
          })
          .attr("class", "halo");

var slider = sliderContainer.append("g")
  .attr("class", "slider")
  .call(brush);

slider.selectAll(".extent, .resize").remove();

slider.select(".background").attr("height", sliderHeight);

var handle = slider.append("circle")
  .attr("class", "handle")
  .attr("transform", "translate(0," + sliderHeight / 2 + ")")
  .attr("r", 9);

// Field selector
var fieldSelector = d3.select("#field-selector")
      .on("change", fieldSelected);

for (var key in maps) {
  fieldSelector.append("option")
  .attr("value", key)
  .text(maps[key].label);
}

// Legend
var legend = svg.append("g")
  .attr("transform", "translate(" + (width - 190) + "," + 200 + ")")
  .classed("legend", true);

var legendDate = legend.append("g")
  .attr("transform", "translate(0,0)")
  .append("text")
  .classed("date-label", "true");

var legendField = legend.append("g")
  .attr("transform", "translate(0,20)")
  .append("text");

var legendColors = legend.append("g")
  .attr("class","legend-colors")
  .attr("transform", "translate(10,40)");

// Map functions
var path = d3.geo.path().projection(null);

// Zooming
var zoom = d3.behavior.zoom()
  .translate([0,0])
  .scale(1)
  .scaleExtent([1,maxZoom])
  .on("zoom", zoomed);

svg.append("rect").attr("class", "overlay")
  .attr("width", width).attr("height", height)
  .on("click", reset);

// svg.call(zoom).call(zoom.event); // uncomment to pan and zoom manually

// Tooltip
var tooltip = d3.select("body").append("div")
  .classed("tooltip", true)
  .classed("hidden", true);

function ready(error, coast, us, census) { 

  if (error) {
    loading.text("Sorry, there has been an error. " +
                 "Please refresh and try again.");
    console.log(error);
  }

  data.coast  = coast;
  data.us     = us;
  data.census = d3.nest()
    .key( function(d) {return d.GISJOIN;})
    .key( function(d) {return d.year;})
    .map(census, d3.map);

  // Draw the map for the first time
  slider.call(brush.event).call(brush.extent([1790, 1790])).call(brush.event);
  drawCoast();
  drawMap(current.year, current.map);
  loading.remove();

}  

function tooltipText(d) {

  var val;
  var sPop   = "n/a",
      fbPop  = "n/a",
      ftPop  = "n/a",
      sPerc  = "n/a",
      fbPerc = "n/a",
      ftPerc = "n/a",
      tPop   = "n/a",
      sDen   = "n/a",
      fbDen  = "n/a",
      ftDen  = "n/a",
      tDen   = "n/a";

  if (data.census.has(d.id) && data.census.get(d.id).has(current.year.toString())) {

    val = data.census.get(d.id).get(current.year.toString())[0];

    sPop   = val.slavePopulation;
    fbPop  = val.freeAfAmPopulation;
    ftPop  = val.freeTotalPopulation;
    sPerc  = percentageFormat(val.slavePercentage / 100); 
    fbPerc = percentageFormat(val.freeAfAmPercentage / 100); 
    ftPerc = percentageFormat(val.freeTotalPercentage / 100);
    tPop   = val.totalPopulation;
    sDen   = densityFormat(val.slaveDensity);
    fbDen  = densityFormat(val.freeAfAmDensity);
    ftDen  = densityFormat(val.freeTotalDensity);
    tDen   = densityFormat(val.totalDensity);
  }

 return "<h5>" + d.properties.c + ", " + d.properties.s + "</h5>" +
   "<table>" +
   "<tr>" +
   "<td class='field'>Slaves: </td>" +
   "<td>" + sPop.toLocaleString() + "</td>" +
   "<td style='width:65px;'>" + sPerc + "</td>" +
   "</tr><tr>"+
   "<td class='field'>Free African Americans: </td>" +
   "<td>" + fbPop.toLocaleString() + "</td>" +
   "<td style='width:65px;'>" + fbPerc + "</td>" +
   "</tr><tr>"+
   "<td class='field'>Total free population: </td>" +
   "<td>" + ftPop.toLocaleString() + "</td>" +
   "<td style='width:65px;'>" + ftPerc + "</td>" +
   "</tr><tr>"+
   "<td class='field'>Total population: </td>" +
   "<td>" + tPop.toLocaleString() + "</td>" +
   "<td></td>" +
   "</tr><tr>"+
   "<td class='field table-break'>Slaves/mile²: </td>" +
   "<td class='table-break'>" + sDen + "</td>" +
   "</tr><tr>"+
   "<td class='field'>Free African Americans/mile²: </td>" +
   "<td>" + fbDen + "</td>" +
   "</tr><tr>"+
   "<td class='field'>Total free persons/mile²: </td>" +
   "<td>" + ftDen + "</td>" +
   "</tr><tr>"+
   "<td class='field'>All persons/mile²: </td>" +
   "<td>" + tDen + "</td>" +
   "</tr></table>";
}

function brushed() {
  var value = brush.extent()[0];
  if (d3.event.sourceEvent) { // not a programmatic event
    value = x.invert(d3.mouse(this)[0]);
    brush.extent([value, value]);
  }
  handle.attr("cx", x(value));
  var brushDate = brushToYear(value-5);

  // Only redraw the map when we cross the threshold to a new year
  if (brushDate !== current.year) {
    legendDate.text(brushDate + " Census");
    current.year = brushDate;
    drawMap(brushDate, current.map);
  }
}

function drawMap(date, map) {

  var counties = topojson.feature(data.us,
                                  data.us.objects["county_" + current.year]);

  svg.attr("class", map.color);
  svg.selectAll(".counties, .states, .country").remove();

  svg.selectAll(".counties") 
    .data(counties.features)
    .enter()
    .append("path")
    .attr("class", function(d) {
      if(data.census.has(d.id) && data.census.get(d.id).has(current.year.toString())) { 
        return map.scale(data.census.get(d.id).get(current.year.toString())[0][map.field]);
      }
    })
    .classed("na", function(d) {
      return !data.census.has(d.id) || !data.census.get(d.id).has(current.year.toString());
    })
    .classed("counties", true)
    .attr("id", function(d) { return d.id; })
    .attr("d", path)
    .on("click", clicked)
    .on("mousemove", function(d, i) {

      var mouse = d3.mouse(d3.select("body").node());

      tooltip
      .classed("hidden", false)
      .attr("style", "left:" + (mouse[0] + 20) + "px; top:" + (mouse[1] - 100) + "px")
      .html(tooltipText(d)); 
    })
    .on("mouseout", function(d, i) {
      tooltip.classed("hidden", true);
    });

  svg.append("path")
    .datum(topojson.mesh(data.us, data.us.objects["county_" + current.year],
                          function(a, b) { 
                            return a.properties.s !== b.properties.s; 
                          }))
    .attr("class", "decade-" + current.year)
    .classed("states", true) .attr("d", path);

  svg.append("path")
    .datum(topojson.mesh(data.us, data.us.objects["county_" + current.year],
                        function(a, b) { return a === b; }))
    .attr("class", "decade-" + current.year)
    .classed("country", true) 
    .attr("d", path);

  svg.call(zoom.event);

  current.map = map;
  updateLegend(map);
}

function drawCoast() {
  var coastline = topojson.feature(data.coast, data.coast.objects.coast);
  svg
  .selectAll(".coast")
  .data(coastline.features)
  .enter()
  .append("path")
  .attr("class", "coast")
  .attr("d", path);
}

function fieldSelected() {
  field = fieldSelector.node().value;
  drawMap(current.year, maps[field]);
}

function updateLegend(map) {

  legendDate.text(current.year + " Census");
  legendField.text(map.label);

  legendColors.selectAll("circle, text").remove();

  for(i = 0; i <= 8; i++) {
    legendColors
      .append("circle")
      .attr("cx", 0)
      .attr("cy", i * 20)
      .attr("r", 7)
      .attr("class", map.color + " q" + i + "-9");

    var bounds = map.scale.invertExtent("q" + i + "-9");

    legendColors
      .append("text")
      .attr("x", 12)
      .attr("y", i * 20 + 5)
      .text(d3.round(bounds[0], 2).toLocaleString() + 
            "–" +
            d3.round(bounds[1], 2).toLocaleString() );
  }

  legendColors.append("circle")
    .attr("cx", 0).attr("cy", 180).attr("r", 7)
    .classed("na", true);

  legendColors.append("text")
    .attr("x", 12).attr("y", 185)
    .text("Not available");

}

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      // Never zoom in more than the max scale
      scale = Math.min(0.75 / Math.max(dx / width, dy / height), maxZoom),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  svg.selectAll(".coast").style("stroke-width", 1.25 / d3.event.scale + "px");
  svg.selectAll(".country").style("stroke-width", 1.0 / d3.event.scale + "px");
  svg.selectAll(".states").style("stroke-width", 1.0 / d3.event.scale + "px");
  svg.selectAll(".counties").style("stroke-width", 0.25 / d3.event.scale + "px");
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}
