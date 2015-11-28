
// refresh data based on UI values
function refreshData() {
  //var commodity = $('#commodity').val().toLowerCase();
  var file = fileName[commodity];
  if (file == null) {
      alert('Raw data not found for ' + commodity);
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
}

// refresh chart for the new context
function refreshChart() {
  if (plot_data.length == 0) {
    return;
  }

  plot_voronoi(plot_data, $('#price').val());

}
