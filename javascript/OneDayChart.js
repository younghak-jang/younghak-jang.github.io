
function plot_OneDayChart() {

  console.log(': start plotting one-day chart ...');
  console.log(': one_day_date = ' + one_day_date);
  $("body").css("cursor", "progress");


// d3.select('#SelectBoxContainer').remove()
d3.select('#PriceChartContainer3').remove();
d3.select('#VolumeChartContainer3').remove();
d3.select('#InterestChartContainer3').remove();

// d3.select('#content').append("div").attr('id', 'SelectBoxContainer')
d3.select('#tab3').append("div").attr('id', 'PriceChartContainer3');
d3.select('#tab3').append("div").attr('id', 'VolumeChartContainer3');
d3.select('#tab3').append("div").attr('id', 'InterestChartContainer3');

// set sizes
var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 900 - margin.left - margin.right,
    height1 = 300 - margin.top - margin.bottom,
    height2 = 150 - margin.top - margin.bottom,
    height3 = 150 - margin.top - margin.bottom;

// set formats
var parseDate = d3.time.format("%x").parse,
    formatDate = d3.time.format("%b-%Y"),
    formatDate2 = d3.time.format("%x"),
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatWithCommas = d3.format("0,000"),
    formatValue = d3.format(",.2f"),
    formatCurrency = function(d) { return "$" + formatValue(d); };

// set scales
// x_time = d3.scale.ordinal().rangePoints([0, width])
var x_time = d3.scale.ordinal().rangeRoundBands([0, width]),
    y_price = d3.scale.linear().range([height1, 0]),
    y_volume = d3.scale.linear().range([height2, 0]),
    y_interest = d3.scale.linear().range([height3, 0]);


// create axes
var xAxis1 = d3.svg.axis().scale(x_time).orient("bottom").tickFormat(function (d) { return formatDate(new Date(d)); }),
    xAxis2 = d3.svg.axis().scale(x_time).orient("bottom").tickFormat(function (d) { return formatDate(new Date(d)); }),
    xAxis3 = d3.svg.axis().scale(x_time).orient("bottom").tickFormat(function (d) { return formatDate(new Date(d)); }),
    yAxis1 = d3.svg.axis().scale(y_price).orient("right").ticks(5).tickSize(width).outerTickSize(0).tickFormat( function (d) { return formatValue(d) ;}),
    yAxis2 = d3.svg.axis().scale(y_volume).orient("left").ticks(3).outerTickSize(0),
    yAxis3 = d3.svg.axis().scale(y_interest).orient("left").ticks(3).outerTickSize(0);

function customAxis(g) {
     g.selectAll("text")
      .attr("x", -50)
      .attr("dy", 0);
};

// create line elements
var line1 = d3.svg.line()
  .x(function(d) { return (x_time(d.date) + center_adj) })
  .y(function(d) { return y_price(d.price) });

var line2 = d3.svg.line()
  .x(function(d) { return (x_time(d.date) + center_adj) })
  .y(function(d) { return y_volume(d.volume) });

var line3 = d3.svg.line()
  .x(function(d) { return (x_time(d.date) + center_adj) })
  .y(function(d) { return y_interest(d.interest) });

// set color scales
var priceColors = d3.scale.category10();
var volumeColors = d3.scale.category20c();
var interestColors = d3.scale.category20b();
var contractColors = d3.scale.category10();

// create svg elements and bind them to their respective divs
var svgPriceChart = d3.select("#PriceChartContainer3").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height1 + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgVolumeChart = d3.select("#VolumeChartContainer3").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height2 + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgInterestChart = d3.select("#InterestChartContainer3").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height3 + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// read & bind data
var plot_data3 = data[commodity];

  // choose which variables to plot
  priceColors.domain(d3.keys(plot_data3[0]).filter(function(key) {
    return key.indexOf("close_price") >= 0;
  }));

  volumeColors.domain(d3.keys(plot_data3[0]).filter(function(key) {
    return key.indexOf("volume") >= 0;
  }));

  interestColors.domain(d3.keys(plot_data3[0]).filter(function(key) {
    return key.indexOf("interest") >= 0;
  }));

  // populate trade dates
  var contracts = plot_data3.map(function(d) { return d.trade_date; });
  var earliest = d3.min(contracts);
  var latest = d3.max(contracts);

  if (one_day_date == null) {
    one_day_date = earliest;
  }
  console.log(':earliest = ' + earliest);
  console.log(':latest = ' + latest);
  console.log(':one_day_date = ' + one_day_date);

  // initialize datepicker
  $( "#datepicker" ).datepicker( "option", "minDate", formatDate2(earliest) );
  $( "#datepicker" ).datepicker( "option", "maxDate", formatDate2(latest) );
  $( "#datepicker" ).datepicker( "option", "defaultDate", formatDate2(one_day_date) );
  $( "#datepicker" ).datepicker().datepicker('setDate', formatDate2(one_day_date)) ;

  tradeDateLabel.hidden = false
  datepicker.hidden = false

  // subset data by trade_date
  var sDate = one_day_date.toDateString();
  var contract_data3 = plot_data3.filter(function(d) { return d.trade_date.toDateString() == sDate; });
  var num_contracts = contract_data3.map(function(d) { return d.delivery_date; }).length;
  var center_adj = width/2/(num_contracts)
  console.log('num_contracts = ' + num_contracts)

  var prices = priceColors.domain().map(function(name) {
    return {
      name: name,
      values: contract_data3.map(function(d) {
        return {date: d.delivery_date, price: +d[name]};
      })
    };
  });

  var volumes = volumeColors.domain().map(function(name) {
    return {
      name: name,
      values: contract_data3.map(function(d) {
        return {date: d.delivery_date, volume: +d[name]};
      })
    };
  });

  var interests = interestColors.domain().map(function(name) {
    return {
      name: name,
      values: contract_data3.map(function(d) {
        return {date: d.delivery_date, interest: +d[name]};
      })
    };
  });

  // set contract colors
  contractColors.domain(contract_data3.map(function(d) { return d.delivery_date; }));

  // set axis domains
  x_time.domain(d3.set(contract_data3.map(function(d) { return d.delivery_date; })).values());

  y_price.domain([
    d3.min(prices.filter(function(d) { return d.name.indexOf('close_price')>=0}), function(c) { return d3.min(c.values, function(v) { return v.price; }); }),
    d3.max(prices.filter(function(d) { return d.name.indexOf('close_price')>=0}), function(c) { return d3.max(c.values, function(v) { return v.price; }); })
  ]);

  y_price.domain([y_price.domain()[0], y_price.domain()[1] + (y_price.domain()[1] - y_price.domain()[0])*0.10]);


  y_volume.domain([
    d3.min(volumes.filter(function(d) { return d.name.indexOf('volume')>=0}), function(c) { return d3.min(c.values, function(v) { return v.volume; }); }),
    d3.max(volumes.filter(function(d) { return d.name.indexOf('volume')>=0}), function(c) { return d3.max(c.values, function(v) { return v.volume; }); })
  ]);

  y_volume.domain([y_volume.domain()[0], y_volume.domain()[1] + (y_volume.domain()[1] - y_volume.domain()[0])*0.10]);

  y_interest.domain([
    d3.min(interests.filter(function(d) { return d.name.indexOf('interest')>=0}), function(c) { return d3.min(c.values, function(v) { return v.interest; }); }),
    d3.max(interests.filter(function(d) { return d.name.indexOf('interest')>=0}), function(c) { return d3.max(c.values, function(v) { return v.interest; }); })
  ]);

  y_interest.domain([y_interest.domain()[0], y_interest.domain()[1] + (y_interest.domain()[1] - y_interest.domain()[0])*0.10]);

  // add axis elements
  var svgXAxis1 = svgPriceChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height1 + ")")
      .call(xAxis1);

  var svgYAxis1 = svgPriceChart.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
      .call(customAxis);

  var svgXAxis2 = svgVolumeChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  var svgYAxis2 = svgVolumeChart.append("g")
      .attr("class", "y axis")
      .call(yAxis2);

  var svgXAxis3 = svgInterestChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height3 + ")")
      .call(xAxis3);

  svgXAxis3.append("text")
      //.attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", width)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Contract Delivery Month");

  var svgYAxis3 = svgInterestChart.append("g")
      .attr("class", "y axis")
      .call(yAxis3);

  // add price chart elements
  var price = svgPriceChart.selectAll(".price")
      .data(prices)
      .enter().append("g")
      .attr("class", "price");

  var priceLines = price.append("path")
      .attr("class", "priceLine")
      .attr("d", function(d) { return line1(d.values); })
      .attr("data-legend",function(d) { return d.name})
      .attr('clip-path', 'url(#clip)')
      .style("stroke", function(d) { return priceColors(d.name); })
      .style("stroke-dasharray", ("3, 3"));

  var priceDots = price.selectAll("circle")
      .data(function (d) { return d.values; })
      .enter().append("path")
      .attr("class", "dot")
      .attr("d", d3.svg.symbol())
      .attr("transform", function(d) { return "translate(" + (x_time(d.date) + center_adj) + "," + y_price(d.price) + ")"; })
      .style("fill", function(d) { return contractColors(d.date) });

  var priceLabels = price.selectAll("text")
        .data(function(d) { return d.values; })
        .enter().append("text")
        .text(function(d) { return formatCurrency(d.price); })
        .attr("font-weight", "bold")
        .attr("x", function(d) { return (x_time(d.date) + center_adj); })
        .attr("y", function(d) { return y_price(d.price) - 7; })
        .attr("text-anchor", "middle");

  //add title
  svgPriceChart.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - margin.top/3)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Close Price ($)");

  // add volume chart elements
  var volume = svgVolumeChart.selectAll(".volume")
      .data(volumes)
      .enter().append("g")
      .attr("class", "volume");


  var volumeBars =  volume.selectAll("rect")
      .data(function (d) { return d.values; })
      .enter().append("rect")
      .attr("class", "bar")
   	  .attr("x", function(d, i) { return i * (width/num_contracts); })
   	  .attr("y", function(d) { return y_volume(d.volume); })
   	  .attr("width", width/num_contracts - 1)
	  .attr("height", function(d) {return height2 - y_volume(d.volume); })
	  .attr("fill", function(d) {return contractColors(d.date) });

  var volumeLabels = volume.selectAll("text")
  		.attr("class", "label")
        .data(function(d) { return d.values; })
        .enter().append("text")
        .text(function(d) { return formatWithCommas(d.volume); })
        .attr("font-weight", "bold")
        .attr("x", function(d) { return (x_time(d.date) + center_adj); })
        .attr("y", function(d) { return y_volume(d.volume) - 7; });

  //add title
  svgVolumeChart.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - margin.top/3)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Volume");

  // add open interest chart elements
  var interest = svgInterestChart.selectAll(".interest")
      .data(interests)
      .enter().append("g")
      .attr("class", "interest");


  var interestBars =  interest.selectAll("rect")
      .data(function (d) { return d.values; })
      .enter().append("rect")
      .attr("class", "bar")
   	  .attr("x", function(d, i) { return i * (width/num_contracts); })
   	  .attr("y", function(d) { return y_interest(d.interest); })
   	  .attr("width", width/num_contracts - 1)
	  .attr("height", function(d) {return height3 - y_interest(d.interest); })
	  .attr("fill", function(d) {return contractColors(d.date) });

  var interestLabels = interest.selectAll("text")
  		.attr("class", "label")
        .data(function(d) { return d.values; })
        .enter().append("text")
        .text(function(d) { return formatWithCommas(d.interest); })
        .attr("font-weight", "bold")
        .attr("x", function(d) { return (x_time(d.date) + center_adj); })
        .attr("y", function(d) { return y_interest(d.interest) - 7; });

  //add title
  svgInterestChart.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - margin.top/3)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Open Interest");

$("body").css("cursor", "default");
console.log(':finished plotting one-day chart ...');
}
