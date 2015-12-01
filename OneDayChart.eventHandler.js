// event handler for dropdown selection change
function newContractFunc() {
    var selectBox = document.getElementById("selectContract");
    if (selectBox.selectedIndex < 0) return;
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    
    contract_data = corn.filter(function(d) { return d.trade_date == selectedValue });
    num_contracts = d3.set(contract_data.map(function(d) { return d.delivery_date; })).values().length
    center_adj = width/2/num_contracts
    
    function customAxis(g) {
     g.selectAll("text")
      .attr("x", -50)
      .attr("dy", 0);
    }
    
    prices.forEach(function(p) {
      p.values = contract_data.map(function(d) {
        return {date: d.delivery_date, price: +d[p.name]};
      })
    });
    
    volumes.forEach(function(v) {
      v.values = contract_data.map(function(d) {
        return {date: d.delivery_date, volume: +d[v.name]};
      })
    });
        
    interests.forEach(function(i) {
      i.values = contract_data.map(function(d) {
        return {date: d.delivery_date, interest: +d[i.name]};
      })
    });

  x_time.domain(d3.set(contract_data.map(function(d) { return d.delivery_date; })).values());

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

    // update axes
    svgXAxis1.transition().duration(0).call(xAxis1);
    svgXAxis2.transition().duration(0).call(xAxis2);
    svgXAxis3.transition().duration(0).call(xAxis3);

    svgYAxis1.transition().duration(0).call(yAxis1).call(customAxis);;
    svgYAxis2.transition().duration(0).call(yAxis2);
    svgYAxis3.transition().duration(0).call(yAxis3);
    
	// update lines
    priceLines.transition().duration(800).attr("d", function(d) { return line1(d.values); });
    
    // update dots
    priceDots.remove()
	priceDots = svgPriceChart.selectAll("g.dot")
      .data(prices)
      .enter().append("g")
      .selectAll("circle")
      .data(function (d) { return d.values; })
      .enter().append("path")
      .attr("class", "dot")
      .attr("d", d3.svg.symbol())
      .attr("transform", function(d) { return "translate(" + (x_time(d.date) + center_adj) + "," + y_price(d.price) + ")"; })
      .attr("fill", function(d) { return contractColors(d.date) });
    
    volumeBars.remove()
    volumeBars =  svgVolumeChart.selectAll("g.rect")
      .data(volumes)
      .enter().append("g")
      .selectAll("rect")
      .data(function (d) { return d.values; })
      .enter().append("rect")
      .attr("class", "bar")
   	  .attr("x", function(d, i) { return i * (width/num_contracts); })
   	  .attr("y", function(d) { return y_volume(d.volume); })
   	  .attr("width", width/num_contracts - 1)
	  .attr("height", function(d) {return height2 - y_volume(d.volume); })
	  .attr("fill", function(d) {return contractColors(d.date) });
          
    interestBars.remove()
    interestBars =  svgInterestChart.selectAll("g.rect")
      .data(interests)
      .enter().append("g")
      .selectAll("rect")
      .data(function (d) { return d.values; })
      .enter().append("rect")
      .attr("class", "bar")
   	  .attr("x", function(d, i) { return i * (width/num_contracts); })
   	  .attr("y", function(d) { return y_interest(d.interest); })
   	  .attr("width", width/num_contracts - 1)
	  .attr("height", function(d) {return height3 - y_interest(d.interest); })
	  .attr("fill", function(d) {return contractColors(d.date) });
	
	// update text
	priceLabels.remove()
	priceLabels = svgPriceChart.selectAll("g.text")
	    .data(prices)
	    .enter().append("g")
	    .selectAll("text")
        .data(function(d) { return d.values; })
        .enter().append("text")
        .text(function(d) { return formatCurrency(d.price); })
        .attr("font-weight", "bold")
        .attr("x", function(d) { return (x_time(d.date) + center_adj); })
        .attr("y", function(d) { return y_price(d.price) - 7; });

	volumeLabels.remove()
	volumeLabels = svgVolumeChart.selectAll("g.text")
	    .data(volumes)
	    .enter().append("g")
	    .selectAll("text")
        .data(function(d) { return d.values; })
        .enter().append("text")
        .text(function(d) { return formatWithCommas(d.volume); })
        .attr("font-weight", "bold")
        .attr("x", function(d) { return (x_time(d.date) + center_adj); })
        .attr("y", function(d) { return y_volume(d.volume) - 7; });

	interestLabels.remove()
	interestLabels = svgInterestChart.selectAll("g.text")
	    .data(interests)
	    .enter().append("g")
	    .selectAll("text")
        .data(function(d) { return d.values; })
        .enter().append("text")
        .text(function(d) { return formatWithCommas(d.interest); })
        .attr("font-weight", "bold")
        .attr("x", function(d) { return (x_time(d.date) + center_adj); })
        .attr("y", function(d) { return y_interest(d.interest) - 7; });


}
