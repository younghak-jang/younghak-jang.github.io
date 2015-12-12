
// refresh data based on UI values
function refreshData() {

  // update tab titles with current commodity name
  tab1Label.innerText = 'Main Chart: ' + commodity.toUpperCase();
  tab2Label.innerText = 'Contract Chart: ' + commodity.toUpperCase();
  tab3Label.innerText = 'One-Day Chart: ' + commodity.toUpperCase();

  var file = fileName[commodity];
  if (file == null) {
    if (commodity != null) alert('Raw data not found for ' + commodity);
    return;
  }

  // load csv and filter
  if (data[commodity] == null) {
	  $("body").css("cursor", "progress");
    console.log(timestamp() + ': data not found for ' + commodity + ', start loading ...');
    d3.text('data/' + file, function(error, text) {
      if (error) {
		    $("body").css("cursor", "default");
		    throw error;
	    }
      var temp = d3.csv.parse(header + '\n' + text);
      temp.forEach(function(d) {
        // added by MO
        d.delivery_date = parseDate(d.delivery_date)
        d.trade_date = parseDate(d.trade_date)
        d.open_price = +d.open_price;
        d.high_price = +d.high_price;
        d.low_price = +d.low_price;
        d.close_price = +d.close_price;
        d.volume = +d.volume;
        d.interest = +d.interest;
        // added by MO
      });
      // set slider bounds
      var start = d3.min(temp, function(d) {return d.trade_date;});
      var end = d3.max(temp, function(d) {return d.trade_date;});
      var interval = (end - start)/3600000/24/20; //days
      $("#dateSlider").dateRangeSlider('option', 'bounds', { min: start, max: end });
  		$('#dateSlider').dateRangeSlider('min', start);
      start.setDate(start.getDate() + interval);
      $('#dateSlider').dateRangeSlider('max', start);
      console.log(timestamp() + ': initial range - ' + $("#dateSlider").dateRangeSlider('min')
        + ', ' + $("#dateSlider").dateRangeSlider('max'));

      // cache data
      data[commodity] = temp;
      console.log(timestamp() + ': data load completed for ' + commodity + ' with ' + temp.length + ' rows.');
	    $("body").css("cursor", "default");
      filterData(temp);

    });
  } else {
    // reset slider
    var temp = data[commodity];
    var start = d3.min(temp, function(d) {return d.trade_date;});
    var end = d3.max(temp, function(d) {return d.trade_date;});
    var interval = (end - start)/3600000/24/20; //days
    $("#dateSlider").dateRangeSlider('option', 'bounds', { min: start, max: end });
    $('#dateSlider').dateRangeSlider('min', start);
    start.setDate(start.getDate() + interval);
    $('#dateSlider').dateRangeSlider('max', start);
    filterData(temp);
  }
}

// filter data based on time range
function filterData(com_data) {
  console.log(timestamp() + ': start filtering');
  var startDate = $('#dateSlider').dateRangeSlider('min');
  var endDate = $('#dateSlider').dateRangeSlider('max');
  main_plot_data = com_data.filter(function(d) {
    return d.trade_date >= startDate && d.trade_date <= endDate;
  });
  if (main_plot_data.length == 0) {
    alert('No data found in the selected range!');
    //return;
  }
  console.log(timestamp() + ': find ' + main_plot_data.length + ' rows after filtering');
  refreshChart(main_plot_data);
  refreshChart2();
  refreshChart3()
}

// refresh main chart for the new context
function refreshChart() {
  if (main_plot_data.length == 0) {
    console.log(':main_plot_data is empty')
    return;
  }
  plot_voronoi($('#price').val());
}

// refresh contract chart for the new context
function refreshChart2() {
  if (data[commodity].length == 0) {
    console.log(':data[commodity] is empty')
    return;
  }
  plot_IndContractChart()
}

// refresh one-day chart for the new context
function refreshChart3() {
  if (data[commodity].length == 0) {
    console.log(':data[commodity] is empty')
    return;
  }
  plot_OneDayChart()
}

// contract search
function searchContract(name) {
  if (data[commodity] == null) {
    alert('Please select a commodity first!');
    return;
  }
  console.log(timestamp() + ': search ' + name);
  var cData = data[commodity].filter(function(d) { return d.contract == name; })
  if (cData.length == 0) {
    alert("Contract '" + name + "' not found for " + commodity);
    return;
  }
  // update data on main chart and refresh
  var start = d3.min(cData, function(d) { return d.trade_date; });
  var end = d3.max(cData, function(d) { return d.trade_date; });
  main_plot_data = data[commodity].filter(function(d) { return d.trade_date>=start && d.trade_date<=end; });
  // set slider
  var toRight = start > $('#dateSlider').dateRangeSlider('min');
  if (toRight) {
    $('#dateSlider').dateRangeSlider('max', end);
    $('#dateSlider').dateRangeSlider('min', start);
  } else {
    $('#dateSlider').dateRangeSlider('min', start);
    $('#dateSlider').dateRangeSlider('max', end);
  }
  plot_voronoi($('#price').val()); // this call always set isContractLocked to false (no highlight)
  // highlight the selected contract
  isContractLocked = true;
  highlight_line = cities.filter(function(d) { return d.name == name; })[0].values[0];
  d3.select(highlight_line.city.line).classed("city--hover", true);
}
