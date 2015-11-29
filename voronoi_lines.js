
function plot_voronoi(csv_data, price) {

  console.log(timestamp() + ': start plotting ...');
  $("body").css("cursor", "progress");
  var highlight_contract,
    dayFormat = d3.time.format("%m/%d/%Y").parse;

 var margin = {top: 20, right: 30, bottom: 30, left: 40},
  	width = 960 - margin.left - margin.right,
  	height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale().range([0, width]);

  var y = d3.scale.linear().range([height, 0]);

  var voronoi = d3.geom.voronoi()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); })
    .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

  // remove previous one then add
  d3.select('#voronoi').remove();
  svg = d3.select('#content').append("svg").attr('id', 'voronoi')
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // click handler - single vs. double
  $("#voronoi")
      .bind("click", function(e){

          clicks++;  //count clicks

          if(clicks === 1) {

              timer = setTimeout(function() {
                  isSingleClicked = !isSingleClicked;
                  console.log(highlight_contract + ' is locked: ' + isSingleClicked); //perform single-click action

                  clicks = 0;  //after action performed, reset counter

                  // unhighlight line if it's unlocked
                  if (!isSingleClicked && highlight_line != null) {
                    d3.select(highlight_line.city.line).classed("city--hover", false);
                    focus.attr("transform", "translate(-100,-100)");
                    //focus.select('text').attr('x',0).attr('y',0);
                  }

              }, DELAY);

          } else {

              clearTimeout(timer);  //prevent single-click action

              console.log(highlight_contract + ' Double Click');  //perform double-click action

              clicks = 0;  //after action performed, reset counter
          }

      })
      .bind("dblclick", function(e){
          e.preventDefault();  //cancel system double-click event
      });


  // bind data
  console.log(timestamp() + ': start converting data ...');
  cities = converter(csv_data, price);
  console.log(timestamp() + ': finish converting data ...');

  // get days
  var days = $(cities).map(function() { return this.values.map(function(r) { return r.date; }); });
  x.domain(d3.extent(days));
  y.domain([d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.value; }); }),
		    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.value; }); })]).nice();

  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis()
        .scale(x)
        .orient("bottom"));

  svg.append("g")
      .attr("class", "axis axis--y")
      .call(d3.svg.axis()
        .scale(y)
        .orient("left"))
      .append("text")
      .attr("x", 4)
      .attr("dy", ".32em")
      .style("font-weight", "bold")
      .text("Price($)");

  svg.append("g")
      .attr("class", "cities")
      .selectAll("path")
      .data(cities)
      .enter().append("path")
      .attr("d", function(d) { d.line = this; return line(d.values); });

  var focus = svg.append("g")
      .attr("transform", "translate(-100,-100)")
      .attr("class", "focus");

  // labels and focus point
  focus.append("circle").attr("r", 3.5);
  focus.append("text").attr("y", -10);

  var voronoiGroup = svg.append("g").attr("class", "voronoi");

  console.log(timestamp() + ': start building voronoi mesh ...');
  voronoiGroup.selectAll("path")
      .data(voronoi(d3.nest()
          .key(function(d) { return x(d.date) + "," + y(d.value); })
          .rollup(function(v) { return v[0]; })
          .entries(d3.merge(cities.map(function(d) { return d.values; })))
          .map(function(d) { return d.values; })))
    .enter().append("path")
      .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
      .datum(function(d) { return d.point; })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);
  console.log(timestamp() + ': finish building voronoi mesh ...');

  var bisectData = d3.bisector(function(d) { return d.date; }).left;
  function mouseover(d) {
    if (!isSingleClicked) {
      highlight_line = d;
      highlight_contract = d.city.name;
      d3.select(d.city.line).classed("city--hover", true);
      d.city.line.parentNode.appendChild(d.city.line);
      focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
      focus.select("text").text(d.city.name).attr("transform", "translate(0,0)");
    } else {
      // only move focus point
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectData(highlight_line.city.values, x0, 1),
        d0 = highlight_line.city.values[i - 1],
			  d1 = highlight_line.city.values[i];
      if (d1 == null) return;
			var ds = (x0 - d0.date) > (d1.date - x0) ? d1 : d0;
      focus.attr("transform", "translate(" + x(ds.date) + "," + y(ds.value) + ")");
      focus.select("text").text(ds.city.name + ' - '
          + ds.date.getFullYear() + '/' + ds.date.getMonth() + '/' + ds.date.getDay() + ': $' + ds.value)
        .attr("transform", "translate(0," + (0-y(ds.value)) + ")")
        .attr('align', 'left');
    }
  }

  function mouseout(d) {
    if (!isSingleClicked) {
      d3.select(d.city.line).classed("city--hover", false);
      highlight_contract = "";
      focus.attr("transform", "translate(-100,-100)");
    }
  }
  $("body").css("cursor", "default");
  console.log(timestamp() + ': finish plotting ...');
}

function converter(csvData, field) {
  // get contracts
  field += '_price';
  var contracts = d3.set(csvData.map(function(row) { return row.contract; })).values();
  // for each contract, get one row of the weird data format
  return contracts.map(function(contract) {
    var contract_rows = csvData.filter(function(row) { return row.contract == contract; });
	var contract_data = {name: contract, values: null};
	contract_data.values = contract_rows.map(function(row) {
	  return {
	    city: contract_data,
		date: row.filter_date, //dayFormat(row.trade_date),
		value: +row[field] // price type
	  };
	});
	return contract_data;
  });
}

function timestamp() {
  var dt = new Date();
  return dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
}
