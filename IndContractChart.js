
function plot_IndContractChart() {

  console.log(': start plotting ...');
  $("body").css("cursor", "progress");


d3.select('#PriceChartContainer2').remove()
d3.select('#VolumeChartContainer2').remove()
d3.select('#InterestChartContainer2').remove()

d3.select('#tab2').append("div").attr('id', 'PriceChartContainer2');
d3.select('#tab2').append("div").attr('id', 'VolumeChartContainer2');
d3.select('#tab2').append("div").attr('id', 'InterestChartContainer2');

// click handler - single vs. double
$("#PriceChartContainer2")
    .bind("click", function(e){

        clicks++;  //count clicks

        if(clicks === 1) {

            timer = setTimeout(function() {
                isSingleClicked = !isSingleClicked;
                console.log(highlight_contract + ' is locked: ' + isSingleClicked); //perform single-click action

                clicks = 0;  //after action performed, reset counter

                console.log(one_day_date.toDateString() + ' single click, do nothing.');  //perform double-click action

            }, DELAY);

        } else {

            clearTimeout(timer);  //prevent single-click action
            console.log(one_day_date.toDateString() + ' double click');  //perform double-click action
            clicks = 0;  //after action performed, reset counter
            plot_OneDayChart();
            $( "#tabs" ).tabs( "option", "active", 2 );
        }

    })
    .bind("dblclick", function(e){
        e.preventDefault();  //cancel system double-click event
    });

// set sizes
var margin = {top: 50, right: 250, bottom: 50, left: 100},
    width = 1100 - margin.left - margin.right,
    height1 = 400 - margin.top - margin.bottom;
    height2 = 150 - margin.top - margin.bottom;
    height3 = 150 - margin.top - margin.bottom;

// set formats
var parseDate = d3.time.format("%x").parse,
    formatDate = d3.time.format("%b-%Y"),
    formatDate2 = d3.time.format("%m/%d/%Y")
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatWithCommas = d3.format("0,000")
    formatValue = d3.format(",.2f"),
    formatCurrency = function(d) { return "$" + formatValue(d); };

// set scales
x_time = d3.time.scale().range([0, width]);
y_price = d3.scale.linear().range([height1, 0]);
y_volume = d3.scale.linear().range([height2, 0]);
y_interest = d3.scale.linear().range([height3, 0]);


// create axes
xAxis1 = d3.svg.axis().scale(x_time).orient("bottom");
xAxis2 = d3.svg.axis().scale(x_time).orient("bottom");
xAxis3 = d3.svg.axis().scale(x_time).orient("bottom");
yAxis1 = d3.svg.axis().scale(y_price).orient("right").ticks(5).tickSize(width).outerTickSize(0).tickFormat( function (d) { return formatValue(d) ;});
yAxis2 = d3.svg.axis().scale(y_volume).orient("left").ticks(3).outerTickSize(0);
yAxis3 = d3.svg.axis().scale(y_interest).orient("left").ticks(3).outerTickSize(0);

function customAxis(g) {
     g.selectAll("text")
      .attr("x", -50)
      .attr("dy", 0);
}

// create line elements
line1 = d3.svg.line()
  .x(function(d) { return (x_time(d.date) ) })
  .y(function(d) { return y_price(d.price) })

line2 = d3.svg.line()
  .x(function(d) { return (x_time(d.date) ) })
  .y(function(d) { return y_volume(d.volume); })

line3 = d3.svg.line()
  .x(function(d) { return (x_time(d.date) ) })
  .y(function(d) { return y_interest(d.interest) });


// set color scales
priceColors = d3.scale.category10();
volumeColors = d3.scale.category10();
interestColors = d3.scale.category10();


// create svg elements and bind them to their respective divs
svgPriceChart = d3.select("#PriceChartContainer2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height1 + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svgVolumeChart = d3.select("#VolumeChartContainer2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height2 + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svgInterestChart = d3.select("#InterestChartContainer2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height3 + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// read & bind data
var commodity_data = data[commodity];

// choose which variables to plot
  priceColors.domain(d3.keys(commodity_data[0]).filter(function(key) {
    return key.indexOf("price") >= 0;
  }));

  volumeColors.domain(d3.keys(commodity_data[0]).filter(function(key) {
    return key.indexOf("volume") >= 0;
  }));

  interestColors.domain(d3.keys(commodity_data[0]).filter(function(key) {
    return key.indexOf("interest") >= 0;
  }));

  // populate contracts
  var contracts = d3.set(commodity_data.map(function(d) { return d.delivery_date })).values();
  var earliest = d3.min(contracts)

  var sel = document.getElementById('selectContract');
  for(var i = 0; i < contracts.length; i++) {
    var opt = document.createElement('option');
    opt.innerHTML = contracts[i];
    opt.value = contracts[i];
    opt.text = formatDate(new Date(contracts[i]))
    sel.appendChild(opt);
  }
  sel.value = earliest


    // subset data by delivery_date
  contract_data = commodity_data.filter(function(d) { return d.delivery_date == earliest });
  console.log('contract_data[0] = ' + contract_data[0] + '.')
  num_contracts = d3.set(contract_data.map(function(d) { return d.trade_date; })).values().length
  console.log('num_contracts = ' + num_contracts + '.')
  center_adj = width/2/(num_contracts)

  contract_data.sort(function(a, b) {
      return a.trade_date - b.trade_date;
    });

  prices = priceColors.domain().map(function(name) {
    return {
      name: name,
      values: contract_data.map(function(d) {
        return {date: d.trade_date, price: +d[name]};
      })
    };
  });

  volumes = volumeColors.domain().map(function(name) {
    return {
      name: name,
      values: contract_data.map(function(d) {
        return {date: d.trade_date, volume: +d[name]};
      })
    };
  });

  interests = interestColors.domain().map(function(name) {
    return {
      name: name,
      values: contract_data.map(function(d) {
        return {date: d.trade_date, interest: +d[name]};
      })
    };
  });


  // set axis domains
  x_time.domain(d3.extent(contract_data, function(d) { return d.trade_date; }));
  console.log('x_time.domain = ' + x_time.domain)

  y_price.domain([
    d3.min(prices.filter(function(d) { return d.name.indexOf('price')>=0}), function(c) { return d3.min(c.values, function(v) { return v.price; }); }),
    d3.max(prices.filter(function(d) { return d.name.indexOf('price')>=0}), function(c) { return d3.max(c.values, function(v) { return v.price; }); })
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

  console.log(':data[0].trade_date = ' + commodity_data[0].trade_date)
  vData1 = [{"date":commodity_data[0].trade_date, "price": 0},
            {"date":commodity_data[0].trade_date, "price": y_price.domain()[1]}]

  vData2 = [{"date":commodity_data[0].trade_date, "volume": 0},
            {"date":commodity_data[0].trade_date, "volume": y_volume.domain()[1]}]

  vData3 = [{"date":commodity_data[0].trade_date, "interest": 0},
            {"date":commodity_data[0].trade_date, "interest": y_interest.domain()[1]}]


  // add axis elements
  svgXAxis1 = svgPriceChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height1 + ")")
      .call(xAxis1);

  svgYAxis1 = svgPriceChart.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
      .call(customAxis);

  svgXAxis2 = svgVolumeChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  svgYAxis2 = svgVolumeChart.append("g")
      .attr("class", "y axis")
      .call(yAxis2);

  svgXAxis3 = svgInterestChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height3 + ")")
      .call(xAxis3);

  svgXAxis3.append("text")
      .attr("y", 20)
      .attr("x", width)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Trade Date");

  svgYAxis3 = svgInterestChart.append("g")
      .attr("class", "y axis")
      .call(yAxis3);

  // add price chart elements
  var price = svgPriceChart.selectAll(".price")
      .data(prices)
      .enter().append("g")
      .attr("class", "price");

  priceLines = price.append("path")
      .attr("class", "priceLine")
      .attr("d", function(d) { return line1(d.values); })
      .attr("data-legend",function(d) { return d.name})
      .attr('clip-path', 'url(#clip)')
      .style("stroke", function(d) { return priceColors(d.name); })

  vLine1 = svgPriceChart.append("path")
      .datum(vData1)
      .attr("class", "vLine1")
      .attr("d", line1);


  //add title
  svgPriceChart.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - margin.top/3)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Price ($)");


  // add volume chart elements
  var volume = svgVolumeChart.selectAll(".volume")
      .data(volumes)
      .enter().append("g")
      .attr("class", "volume");


  volumeBars =  volume.selectAll("rect")
      .data(function (d) { return d.values; })
      .enter().append("rect")
      .attr("class", "bar")
   	  .attr("x", function(d, i) { return i * (width/num_contracts); })
   	  .attr("y", function(d) { return y_volume(d.volume); })
   	  .attr("width", width/num_contracts - 1)
	  .attr("height", function(d) {return height2 - y_volume(d.volume); })
	  .attr("fill", "#544d56");

  vLine2 = svgVolumeChart.append("path")
      .datum(vData2)
      .attr("class", "vLine2")
      .attr("d", line2);

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


  interestBars =  interest.selectAll("rect")
      .data(function (d) { return d.values; })
      .enter().append("rect")
      .attr("class", "bar")
   	  .attr("x", function(d, i) { return i * (width/num_contracts); })
   	  .attr("y", function(d) { return y_interest(d.interest); })
   	  .attr("width", width/num_contracts - 1)
	  .attr("height", function(d) {return height3 - y_interest(d.interest); })
	  .attr("fill", "#544d56");

  vLine3 = svgInterestChart.append("path")
      .datum(vData3)
      .attr("class", "vLine3")
      .attr("d", line3);

  //add title
  svgInterestChart.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - margin.top/3)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Open Interest");

  // add vertical line parameters
  var tooltip1 = svgPriceChart.selectAll(".tooltip")
        .data(prices)
        .enter().append("g")
        .attr("class", "tooltip")
        .style("display", "none");

  var tooltip2 = svgVolumeChart.selectAll(".tooltip")
        .data(volumes)
        .enter().append("g")
        .attr("class", "tooltip")
        .style("display", "none");

  var tooltip3 = svgInterestChart.selectAll(".tooltip")
        .data(interests)
        .enter().append("g")
        .attr("class", "tooltip")
        .style("display", "none");

  labels11 = svgPriceChart.append("text")
        .attr("x", -75)
        .attr("dy", ".35em")
        .style("stroke", "black");

  labels12 = tooltip1.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("stroke", function(d) { return priceColors(d.name); });

  labels2 = svgVolumeChart.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("stroke", "black");

  labels3 = svgInterestChart.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("stroke", "black");

  svgPriceChart.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height1)
      .on("mouseover", function() {
         vLine1.style("display", null);
         tooltip1.style("display", null);
         })
      .on("mousemove", mousemove);

  svgVolumeChart.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height2)
      .on("mouseover", function() {
        vLine2.style("display", null);
        tooltip2.style("display", null);
      })
      .on("mousemove", mousemove);

  svgInterestChart.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height3)
      .on("mouseover", function() {
        vLine3.style("display", null);
        tooltip3.style("display", null);
      })
      .on("mousemove", mousemove);

legend = svgPriceChart.append("g")
      .attr("class","legend")
      .attr("transform","translate(50,30)")
      .style("font-size","12px")
      .call(d3.legend);

$("body").css("cursor", "default");

}
