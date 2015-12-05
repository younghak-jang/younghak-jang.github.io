
// refresh data based on UI values
function refreshData(commodity) {
  var file = fileName[commodity];
  if (file == null) {
      alert('Raw data not found for ' + commodity);
      return;
  }

  // load csv and filter
  if (data[commodity] == null) {
	$("body").css("cursor", "progress");
    console.log(': data not found for ' + commodity + ', start loading ...');
    try {
    d3.text('data/' + file, function(error, text) {
      if (error) {
		    $("body").css("cursor", "default");
		    throw error;
		    console.log('error in d3.text read ...');
	  };
      var temp = d3.csv.parse(header + '\n' + text);
      console.log('temp file created for ' + commodity + ' with ' + temp.length + ' rows.');
      // cache data
      data[commodity] = temp;
      console.log(': data[commodity] load completed for ' + commodity + ' with ' + data[commodity].length + ' rows.');
	  $("body").css("cursor", "default");

	  refreshChart(data[commodity]);
    })
    }
    catch(err) {
    console.log('try failed');
    };
  }
  else {
     console.log('data[commodity] already exists.  in else statement.');
     refreshChart(data[commodity]);
  };
}

// refresh chart for the new context
function refreshChart(csv_data) {
  if (data[commodity].length == 0) {
    return;
  };

  plot_IndContractChart(csv_data);

}
