
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
        d.filter_date = parseDate(d.trade_date);
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
      var start = d3.min(temp, function(d) {return d.filter_date;});
      var end = d3.max(temp, function(d) {return d.filter_date;});
      var interval = (end - start)/3600000/24/20; //days
      $("#dateSlider").dateRangeSlider('option', 'bounds', { min: start, max: end });
      $('#dateSlider').dateRangeSlider('min', start);
      start.setDate(start.getDate() + interval);
      $('#dateSlider').dateRangeSlider('max', start);
      // cache data
      data[commodity] = temp;
      console.log(timestamp() + ': data load completed for ' + commodity + ' with ' + temp.length + ' rows.');
	    $("body").css("cursor", "default");
      filterData(temp);
      
    });
  } else {
    filterData(data[commodity]);
  }
}

// filter data based on time range
function filterData(com_data) {
  console.log(timestamp() + ': start filtering');
  var startDate = $('#dateSlider').dateRangeSlider('min');
  var endDate = $('#dateSlider').dateRangeSlider('max');
  plot_data = com_data.filter(function(d) {
    return d.filter_date >= startDate && d.filter_date <= endDate;
  });
  if (plot_data.length == 0) {
    alert('No data found in the selected range!');
    //return;
  }
  console.log(timestamp() + ': find ' + plot_data.length + ' rows after filtering');
  refreshChart();
  refreshChart2();
  refreshChart3()
}

// refresh main chart for the new context
function refreshChart() {
  if (plot_data.length == 0) {
    console.log(':plot_data is empty')
    return;
  }
  plot_voronoi(plot_data, $('#price').val());
}

// refresh contract chart for the new context
function refreshChart2() {
  if (data[commodity].length == 0) {
    console.log(':data[commodity] is empty')
    return;
  }
  plot_IndContractChart(data[commodity], main_delivery_date)
}

// refresh one-day chart for the new context
function refreshChart3() {
  if (data[commodity].length == 0) {
    console.log(':data[commodity] is empty')
    return;
  }
  plot_OneDayChart(data[commodity], main_trade_date)
}




