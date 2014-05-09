queue()
.defer(d3.json, "coast.json")
.defer(d3.json, "rivers.json")
.defer(d3.json, "us_1790.json")
.defer(d3.json, "us_1800.json")
.defer(d3.json, "us_1810.json")
.defer(d3.json, "us_1820.json")
.defer(d3.json, "us_1830.json")
.defer(d3.json, "us_1840.json")
.defer(d3.json, "us_1850.json")
.defer(d3.json, "us_1860.json")
.await(ready);

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#viz").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.classed("YlOrRd", true)
.on("click", stopped, true);

var loading = svg.append("text")
.classed("loading", true)
.attr("x", width / 2)
.attr("y", height / 2)
.text("Loading the map ...");

var active = d3.select(null);

var slider_height = 20,
    slider_width = 600;

var slider_svg = d3.select("#slider").append("svg")
.attr("width", slider_width + margin.left + margin.right)
.attr("height", slider_height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var selector = d3.select("#selector")
.classed("variable-selector", true)
.append("select")
.attr("id", "dropdown");

selector.html(
  "<option value='Slave population'>Slave population</option>" +
  "<option value='Total population'>Total population</option>" +
  "<option value='Enslaved persons per mile²'>Enslaved persons per mile²</option>" +
  "<option value='Total persons per mile²'>Total persons per mile²</option>" +
  "<option value='Percentage population enslaved'>Percentage population enslaved</option>"
  );

selector
.on("change", variable_selected);

var scales = {};

var legend = svg
.append("g")
.attr("transform", "translate(" + (width - 150) + "," + 200 + ")")
.classed("legend", true);

var date_label = legend
.append("g")
.attr("transform", "translate(0,0)")
.append("text")
.classed("date-label", "true");

var var_label = legend
.append("g")
.attr("transform", "translate(0,20)")
.append("text")
.classed("variable-label", "true");

var legend_colors = legend
.append("g")
.attr("class","legend-colors")
.attr("transform", "translate(10,50)");

// var quantize = d3.scale.quantize()
// .domain([1, 37290])
// .range(d3.range(9).map(function(i) { return "q" + i + "-9";}));

// Slider
x = d3.scale.linear()
.domain([1785, 1864])
.range([0, slider_width])
.clamp(true);

var x_invert = d3.scale
.threshold()
.domain([1790,1800,1810,1820,1830,1840,1850,1860])
.range([1790,1800,1810,1820,1830,1840,1850,1860]);

var brush = d3.svg.brush()
.x(x)
.extent([1790, 1790])
.on("brush", brushed);

slider_svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + slider_height / 2 + ")")
.call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(8)
      .tickFormat(function(d) { return d; })
      .tickSize(0)
      .tickPadding(12))
      .select(".domain")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "halo");

var slider = slider_svg.append("g")
.attr("class", "slider")
.call(brush);

slider.selectAll(".extent,.resize")
.remove();

slider.select(".background")
.attr("height", slider_height);

var handle = slider.append("circle")
.attr("class", "handle")
.attr("transform", "translate(0," + slider_height / 2 + ")")
.attr("r", 9);

var path = d3.geo.path()
.projection(null);

maxZoom = 8;

var zoom = d3.behavior.zoom()
.translate([0,0])
.scale(1)
.scaleExtent([1,maxZoom])
.on("zoom", zoomed);

svg.append("rect")
.attr("class", "overlay")
.attr("width", width)
.attr("height", height)
.on("click", reset);

svg.call(zoom).call(zoom.event);


var tooltip = d3.select("body").append("div")
.classed("tooltip", true)
.classed("hidden", true);

var data = {};
var already_drawn,
    current_variable = "pop_slave",
    current_colors   = "YlOrdRd",
    current_scale    = scales.logSlaves;

function ready(error, coast, rivers, us_1790, us_1800, us_1810, us_1820,
               us_1830, us_1840, us_1850, us_1860) { 

  data.coast   = coast;
  data.rivers  = rivers;
  data.us_1790 = us_1790;
  data.us_1800 = us_1800;
  data.us_1810 = us_1810;
  data.us_1820 = us_1820;
  data.us_1830 = us_1830;
  data.us_1840 = us_1840;
  data.us_1850 = us_1850;
  data.us_1860 = us_1860;

  // Calculate derivative properties
  for(var i = 1790; i <= 1860; i += 10) {
    // console.log(data["us_" + i].objects);
    data["us_" + i].objects["county_" + i].geometries.forEach(function(d) {
      d.properties.percentage_enslaved = 100 * d.properties.pop_slave / d.properties.pop_total;
      d.properties.slaves_per_mile = d.properties.pop_slave / sqMetersToSqMiles(d.properties.area);
      d.properties.total_per_mile = d.properties.pop_total / sqMetersToSqMiles(d.properties.area);
    });
  }

  // make scales

  var brewer = ["", "q0-9", "q1-9", "q2-9", "q3-9", "q4-9", "q5-9", "q6-9", "q7-9", "q8-9"];

  scales.logSlaves = d3.scale.threshold()
  .domain([1,10,50,100,500,1e3,5e3,10e3,50e3,100e3])
  .range(brewer);

  scales.logPopulation = d3.scale.threshold()
  .domain([10,50,100,500,1e3,5e3,10e3,50e3,100e3,1e6])
  .range(brewer);

  scales.logTotalPopDensity = d3.scale.threshold()
  .domain([0.01,1,5,10,25,50,100,500,1e3,50e3])
  .range(brewer);

  scales.slavePopDensity = d3.scale.threshold()
  .domain([0.01,0.5,1,5,10,20,30,40,50,200])
  .range(brewer);

  scales.percentageSlave = d3.scale.threshold()
  .domain([0.1,10,20,30,40,50,60,70,80,100])
  .range(brewer);

  current_scale = scales.logSlaves;

  draw_coast();

  var_label.text("Slave population");

  update_legend(scales.logSlaves, "YlOrRd");

  slider
  .call(brush.event)
  .call(brush.extent([1790, 1790]))
  .call(brush.event);

  drawRivers();

  loading.remove();

}  

function tooltipText(d) {
  // If a value doesn't exist, leave it blank. But if we need it for 
  // calculations, then make it zero.
  var s      = d.properties.pop_slave || "",
      pt     = d.properties.pop_total || "",
      fw     = d.properties.pop_free_white || "",
      fb     = d.properties.pop_free_black || "",
      fw_0   = d.properties.pop_free_white || 0,
      fb_0   = d.properties.pop_free_black || 0,
      h      = d.properties.slaveholders || "n/a",
      aMiles = sqMetersToSqMiles(d.properties.area); // area in square miles

  var ft = (typeof d.properties.pop_free === "undefined") ? fw_0 + fb_0 : d.properties.pop_free;

  var ps = s/(ft+s) || "n/a",
      pf = ft/(ft+s) || "n/a",
      ph = h/ft || "n/a",
      sh = s/h;

 return "<h5>" + d.properties.county + ", " + d.properties.state + "</h5>" +
   "<p>" +
   "Slave population: <span class='num'>" + s.toLocaleString() + "</span><br>" +
   "Total population: <span class='num'>" + pt.toLocaleString() + "</span><br>" +
   "Enslaved persons/mile²: <span class='num'>" + d3.round((s/aMiles), 2).toLocaleString() + "</span><br>" +
   "Total persons/mile²: <span class='num'>" + d3.round((pt/aMiles), 2).toLocaleString() + "</span><br>" +
   "Free population: <span class='num'>" + ft.toLocaleString() + "</span><br>" +
   "Free black population: <span class='num'>" + fb.toLocaleString() + "</span><br>" +
   "Free white population: <span class='num'>" + fw.toLocaleString() + "</span><br>" +
   "Percentage slaves: <span class='num'>" + percent(ps) + "</span><br>" +
   "Percentage free: <span class='num'>" + percent(pf) + "</span><br>" +
   "Slaveholders: <span class='num'>" + h.toLocaleString() + "</span><br>" +
   "Percentage slaveholders: <span class='num'>" + percent(ph) + "</span><br>" +
   "Slaves per slaveholder: <span class='num'>" + sh.toFixed(2) + "</span>" +
   "</p>";
}

function percent(x) {
  return  isNaN(x) ? "n/a" : (100 * x).toFixed(1).toString() + "%";
}

function brushed() {
  var value = brush.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value = x.invert(d3.mouse(this)[0]);
    brush.extent([value, value]);
  }

  handle.attr("cx", x(value));

  current_date = (x_invert(value-5));


  // Only redraw the map when we cross the threshold to a new year
  if (current_date !== already_drawn) {
    date_label.text(current_date + " Census");

    draw_map(current_date, current_variable, current_scale);

    already_drawn = current_date;

  }

}

function draw_map(date, variable, scale) {

  var us_cur  = data["us_" + date],
      cur     = "county_" + date;

  var counties = topojson.feature(us_cur, us_cur.objects[cur]);

  svg.selectAll(".counties, .states, .country").remove();

  svg
  .selectAll(".counties") 
  .data(counties.features)
  .enter()
  .append("path")
  .attr("class", function(d) {
      return scale(d.properties[variable]);
    })
  .classed("counties", true)
  .attr("id", function(d) { return d.id; })
  .attr("d", path)
  .on("click", clicked)
  .on("mousemove", function(d, i) {
    // var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
    // var offset = d3.select("#viz")[0][0].offsetLeft;

    var mouse = d3.mouse(d3.select("body").node());
    
    // console.log("mouse: " + mouse[0] + "; offset: " + offset);
    // console.log(mouse_body);


    tooltip
    .classed("hidden", false)
    .attr("style", "left:" + (mouse[0] + 40) + "px; top:" + (mouse[1] - 100) + "px")
    .html(tooltipText(d)); 
  })
  .on("mouseout", function(d, i) {
    tooltip.classed("hidden", true);
  });

  svg
  .append("path")
  .datum(topojson.mesh(us_cur, us_cur.objects[cur], function(a, b) { return a.properties.state !== b.properties.state; }))
  .attr("class", "decade-" + current_date)
  .classed("states", true) 
  .attr("d", path);

  svg.append("path")
  .datum(topojson.mesh(us_cur, us_cur.objects[cur], function(a, b) { return a === b; }))
  .attr("class", "decade-" + current_date)
  .classed("country", true) 
  .attr("d", path);

  svg.call(zoom.event);

  svg.selectAll(".rivers").moveToFront();

}

function draw_coast() {

  var coastline = topojson.feature(data.coast, data.coast.objects.coast);

  svg
  .selectAll(".coast")
  .data(coastline.features)
  .enter()
  .append("path")
  .attr("class", "coast")
  .attr("d", path);

}

function drawRivers() {

  var rivers = topojson.feature(data.rivers, data.rivers.objects.rivers);

  svg
  .selectAll(".rivers")
  .data(rivers.features)
  .enter()
  .append("path")
  .attr("class", "rivers")
  .attr("d", path)
  .attr("style", (function(d) { return "stroke-width: " + (0.5 * +d.properties.weight) + ";"; }))
  .on("mousemove", function(d, i) {
    var mouse = d3.mouse(d3.select("body").node());
    tooltip
    .classed("hidden", false)
    .attr("style", "left:" + (mouse[0] + 20) + "px; top:" + (mouse[1] - 10) + "px")
    .html("<h5>" + d.properties.name + " River</hh55>"); 
  })
  .on("mouseout", function(d, i) {
    tooltip.classed("hidden", true);
  });

}

function variable_selected() {
  variable = d3.select("#dropdown").node().value;
  var_label.text(variable);

  if (variable === "Slave population") {
    svg.attr("class", "YlOrRd");
    draw_map(current_date, "pop_slave", scales.logSlaves);
    update_legend(scales.logSlaves, "YlOrRd");
    current_variable = "pop_slave";
    current_scale = scales.logSlaves;
  } else if (variable === "Total population") {
    svg.attr("class", "YlGnBu");
    draw_map(current_date, "pop_total", scales.logPopulation);
    update_legend(scales.logPopulation, "YlGnBu");
    current_variable = "pop_total";
    current_scale = scales.logPopulation;
  } else if (variable === "Enslaved persons per mile²") {
    svg.attr("class", "YlOrRd");
    draw_map(current_date, "slaves_per_mile", scales.slavePopDensity);
    update_legend(scales.slavePopDensity, "YlOrRd");
    current_variable = "slaves_per_mile";
    current_scale = scales.slavePopDensity;
  } else if (variable === "Total persons per mile²") {
    svg.attr("class", "YlGnBu");
    draw_map(current_date, "total_per_mile", scales.logTotalPopDensity);
    update_legend(scales.logTotalPopDensity, "YlGnBu");
    current_variable = "total_per_mile";
    current_scale = scales.logTotalPopDensity;
  } else if (variable === "Percentage population enslaved") {
    svg.attr("class", "YlOrRd");
    draw_map(current_date, "percentage_enslaved", scales.percentageSlave);
    update_legend(scales.percentageSlave, "YlOrRd");
    current_variable = "percentage_enslaved";
    current_scale = scales.percentageSlave;
  }
  
}

function update_legend(scale, colors) {

  legend_colors.selectAll("circle, text").remove();

  for(i = 0; i <= 8; i++) {
    legend_colors
      .append("circle")
      .attr("cx", 0)
      .attr("cy", i * 20)
      .attr("r", 7)
      .attr("class", colors + " q" + i + "-9");

    legend_colors
      .append("text")
      .attr("x", 12)
      .attr("y", i * 20 + 5)
      .text(scale.invertExtent("q" + i + "-9")[0].toLocaleString() + " - " +
             scale.invertExtent("q" + i + "-9")[1].toLocaleString() );
  }

}

// Convert square meters to square miles
function sqMetersToSqMiles(sqMeters) {
  return sqMeters / 2589988.110336;
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
  svg.selectAll(".states").style("stroke-width", 0.5 / d3.event.scale + "px");
  svg.selectAll(".counties").style("stroke-width", 0.25 / d3.event.scale + "px");
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
