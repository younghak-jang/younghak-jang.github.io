// event handler for dropdown selection change
function newContractFunc() {
    var selectBox = document.getElementById("selectContract");
    if (selectBox.selectedIndex < 0) return;
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;

    contract_data = corn.filter(function(d) { return d.delivery_date == selectedValue });
    num_contracts = d3.set(contract_data.map(function(d) { return d.trade_date; })).values().length
    center_adj = width/2/num_contracts
    
    function customAxis(g) {
     g.selectAll("text")
      .attr("x", -50)
      .attr("dy", 0);
    }
    
    contract_data.sort(function(a, b) {
      return a.trade_date - b.trade_date;
    });
    
    prices.forEach(function(p) {
      p.values = contract_data.map(function(d) {
        return {date: d.trade_date, price: +d[p.name]};
      })
    });
    
    volumes.forEach(function(v) {
      v.values = contract_data.map(function(d) {
        return {date: d.trade_date, volume: +d[v.name]};
      })
    });
        
    interests.forEach(function(i) {
      i.values = contract_data.map(function(d) {
        return {date: d.trade_date, interest: +d[i.name]};
      })
    });


  x_time.domain(d3.extent(contract_data, function(d) { return d.trade_date; }));
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
	  .attr("fill", "#544d56");
          
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
	  .attr("fill", "#544d56");
	
}

// event handler for mouse hover
bisectData = d3.bisector(function(d) { return d.trade_date; }).left;
function mousemove() {
	var x0 = x_time.invert(d3.mouse(this)[0]),
		i = bisectData(contract_data, x0, 1),
  		d0 = contract_data[i - 1],
	    d1 = contract_data[i],
		d = (x0 - d0.trade_date) > (d1.trade_date - x0) ? d1 : d0;
  temp_x=x0;
  
  labels11.text(formatDate2(d.trade_date) + ":")
         .attr("transform", "translate(" + (x_time(x0)) + ", -5)")
         .style("font-size", "12px");
         
  labels12.text(function(d) {return d.name == 'volume'? d.values[i].price: (formatCurrency(d.values[i].price)); })
         .attr("transform", function(d) { return "translate(" + (x_time(x0) + priceColors.domain().indexOf(d.name)*50) + ", -5)"; })
         .style("opacity", 1.0)
         .style("font-size", "12px");
         
  labels2.text(formatWithCommas(d.volume))
         .attr("transform", "translate(" + (x_time(x0) + 10) + ", -5)")
         .style("font-size", "12px");
         
  labels3.text(formatWithCommas(d.interest))
         .attr("transform", "translate(" + (x_time(x0) + 10) + ", -5)")
         .style("font-size", "12px");

  vData1[0].date = vData1[1].date = x0;
  vData1[0].price = 0;
  vData1[1].price = y_price.domain()[1];
  vLine1.attr("d", line1);
  
  vData2[0].date = vData2[1].date = x0;
  vData2[0].volume = 0;
  vData2[1].volume = y_volume.domain()[1];
  vLine2.attr("d", line2);
  
  vData3[0].date = vData3[1].date = x0;
  vData3[0].interest = 0;
  vData3[1].interest = y_interest.domain()[1];
  vLine3.attr("d", line3);
  

}


